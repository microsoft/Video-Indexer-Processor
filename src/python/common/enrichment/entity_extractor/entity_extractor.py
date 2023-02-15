"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from textwrap import TextWrapper
import itertools
import logging as log
from typing import List, Union
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import CategorizedEntity
import enrichment.entity_extractor.utils as entity_extractor_utils
import os
log_text = os.getenv("LOG_PREFIX")


class EntityTypeConfig:
    """
    Class that configures how each named entity type should be extracted.
    It contains:
    - id_string is the named entity identifier. Ex. "Location".
    - threshold represents the minimum confidence score that needs to be given to a named entity for it to be considered of enough quality. Ex. 0.85
    - add_from_metadata represents the fields of the metadata file that contain relevant information for this named entity and should be added as-is. Ex. ['field_with_locations']
    - remove_substrings is a boolean telling if those strings that are substrings of another named entity should be removed from the result.
    - capitalize_propernouns is a boolean telling if proper nouns should be capitalized.
    """

    def __init__(
        self,
        id: str,
        threshold: float,
        add_from_metadata: List[str] = [],
        remove_substrings=False,
        capitalize_propernouns=True,
    ):
        self.id_string = id
        self.threshold = threshold
        self.add_from_metadata = add_from_metadata
        self.remove_substrings = remove_substrings
        self.capitalize_propernouns = capitalize_propernouns


class EntityExtractor:
    """
    Class wrapping the named entity extraction client and its utility functions.
    It contains:
    - client is the NER extraction engine that will be used.
    - client_max_processes is the max number of parallel processes the client supports.
    - client_max_string_length is the max number of characters a query to the client can have.
    - entity_type_configs is an array of the configs for the different named entities to be extracted.
    - text_wrapper is a helper object to make sure no query to the client is longer than the max number of characters.
    """

    def __init__(self):
        self.client = None
        self.client_max_processes = 0
        self.client_max_string_length = 0
        self.entity_type_configs = []
        self.text_wrapper = None

    def initialize_client(
        self, endpoint: str, key: str, max_processes=5, max_string_length=5120
    ):
        """Initializes the NER extraction engine and its associated parameters.

        Args:
            endpoint (str): endpoint of the NER extraction engine.
            key (str): key to access the NER extraction engine.
            max_processes (int, optional): maximum number of parallel processes the NER extraction engine can handle. Defaults to 5.
            max_string_length (int, optional): maximum number of characters per query the NER extraction engine can handle.
                Defaults to 5120, which is the maximum Azure TextAnalyticsClient can handle per process.
        """
        if key is not None and endpoint is not None:
            credential = AzureKeyCredential(key)
            self.client = TextAnalyticsClient(endpoint=endpoint, credential=credential)
        self.client_max_processes = max_processes
        self.client_max_string_length = max_string_length
        self.text_wrapper = TextWrapper(width=self.client_max_string_length)

    def initialize_entity_type_configs(
        self, entity_type_configs: List[EntityTypeConfig]
    ):
        """Initializes the configs of the named entity types to be extracted.

        Args:
            entity_type_configs (List[EntityTypeConfig]): List of configurations for the named entity types to be extracted.
        """
        self.entity_type_configs = entity_type_configs

    def extract_entities(
        self,
        parsed_metadata: dict,
        interesting_fields=[
            "video_description",
        ],
        language="en",
    ) -> dict:
        """Finds the named entities in the relevant fields of the metadata.

        Args:
            parsed_metadata (dict): Dictionary representing a parsed metadata JSON file.
            interesting_fields (list, optional): List of interesting fields in the parsed metadata to search for the named entities. Defaults to ['video_description'].
            language (str, optional): language of the text in the metadata file. Defaults to 'en'.

        Returns:
            dict: Dictionary where each entry is a pair (named entity id, list of named entities found and postprocessed according to the config)
        """
        data = EntityExtractor._obtain_data_from_parsed_metadata(parsed_metadata, interesting_fields)
        data = self._prepare_data_for_ner_client(data)
        entities = self._extract_all_entities(data, language)
        return self._select_interesting_entities(parsed_metadata, entities)

    @staticmethod
    def _obtain_data_from_parsed_metadata(
        parsed_metadata: dict, interesting_fields: List[str]
    ) -> List[str]:
        """Obtain the content from the metadata file that is relevant for the search of named entities.

        Args:
            parsed_metadata (dict): dictionary with a parsed metadata file.
            interesting_fields (List[str]): list of relevant fields for the search of named entities.

        Returns:
            List[str]: list with strings from the parsed metadata file over which to perform the search for named entities.
        """
        raw_data = []
        for field in interesting_fields:
            if field in parsed_metadata:
                raw_data.append(parsed_metadata[field])
        # Since some of the content added to raw_data may be lists, flatten the list.
        raw_data = [[elem] if isinstance(elem, str) else elem for elem in raw_data]
        return list(itertools.chain.from_iterable(raw_data))

    @staticmethod
    def _clean_data(data: List[str]) -> List[str]:
        """Remove None elements (potentially other ways to clean the data could be included here).

        Args:
            data (List[str]): list of strings containing potentially useful content for the search of named entities.

        Returns:
            List[str]: list of strings with only those strings that will be searched for named entities.
        """
        return [content for content in data if content is not None]

    def _prepare_data_for_ner_client(self, data: Union[str, List[str]]) -> List[str]:
        """Considering all the lines in the input data as a 'paragraph', split it into lines with at most the maximum width accepted by the NER engine.

        Args:
            data (Union): paragraph with one or more strings representing the content in which named entities will be searched.

        Returns:
            List[str]: list of strings, each with at most as many characters as the max allowed by the client, in which the named entities will be searched.
        """
        data = EntityExtractor._clean_data(data)
        if len(data) == 0:
            return []
        elif len(data) == 1:
            data = data[0]
        elif len(data) > 1:
            data = " ".join(data)
        prepared_data = self.text_wrapper.wrap(text=data)
        return prepared_data

    # TODO: This method is not tested for now because we'd need to mock the NER client.
    def _extract_all_entities(
        self, data: List[str], language: str
    ) -> List[CategorizedEntity]:
        """Extract all named entities in the provided list of strings (data) by calling the NER client.

        Args:
            data (List[str]): where to search for the named entities.
            language (str): language of the text.

        Returns:
            List[CategorizedEntity]: List of named entities in the provided text as recognized by the NER client.
        """
        if self.client is None:
            log.warning(f"P{log_text} NER client is not initialized")
            return []
        returned_entities = []
        for i in range(0, len(data), self.client_max_processes):
            returned_entities.extend(
                self.client.recognize_entities(
                    data[i: i + self.client_max_processes], language=language
                )
            )
        all_entities = []
        for elem in returned_entities:
            if not elem.is_error:
                all_entities.extend(elem.entities)
        return all_entities

    @staticmethod
    def _remove_entities_below_threshold(
        entities: List[CategorizedEntity], threshold: float
    ) -> List[CategorizedEntity]:
        """Remove from the provided list those named entities which confidence score is below the provided threshold.

        Args:
            entities (List[CategorizedEntity]): list of named entities to be filtered.
            threshold (float): minimum value of the confidence score for a named entity to be returned.

        Returns:
            List[CategorizedEntity]: list of filtered named entities according to the threshold.
        """
        return [entity for entity in entities if entity.confidence_score >= threshold]

    def _select_interesting_entities(
        self, parsed_metadata: dict, entities: List[CategorizedEntity]
    ) -> dict:
        """For each named entity type, process the list of entities according to its configuration, add other interesting entities directly from the metadata, and maybe other postprocessing.

        Args:
            parsed_metadata (dict): dictionary with the parsed metadata file.
            entities (List[CategorizedEntity]): list of named entities to be considered.

        Returns:
            dict: Dictionary where each entry is a pair (named entity id, list of named entities found and postprocessed according to the config).
        """
        interesting_entities = {}
        for config in self.entity_type_configs:
            filtered_entities = EntityExtractor._remove_entities_below_threshold(
                entities, config.threshold
            )
            # Normalize to lowercase to remove duplicates.
            # This means that by default named entities will be returned in lowercase.
            text_filtered_entities = set(
                [
                    x.text.lower()
                    for x in filtered_entities
                    if x.category == config.id_string
                ]
            )
            for field in config.add_from_metadata:
                if field in parsed_metadata:
                    content = parsed_metadata[field]
                    if isinstance(content, str):
                        content = [content]
                    text_filtered_entities = text_filtered_entities.union(
                        set([x.lower() for x in content])
                    )
            if config.remove_substrings:
                text_filtered_entities = (
                    entity_extractor_utils.remove_substring_elements(
                        text_filtered_entities
                    )
                )
            if config.capitalize_propernouns:
                text_filtered_entities = entity_extractor_utils.perform_capitalize_propernouns(
                    text_filtered_entities
                )
            interesting_entities[config.id_string] = text_filtered_entities
        return interesting_entities
