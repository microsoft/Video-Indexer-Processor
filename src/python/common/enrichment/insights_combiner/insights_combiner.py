"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
# tell flake8 to ignore specific errors in this file
# noqa: F403,F405

from enrichment.insights_splitter.time_parser import TimeParser
from enrichment.insights_combiner.configuration_variables import *
import logging as log
import os
log_text = os.getenv("LOG_PREFIX")


class InsightsCombiner:
    """
    The class combines multiple insights into a single searchable document
    to be saved as part of a search index
    """

    def __init__(self):

        self.final_document = {}
        self.vi_insights = {}
        self.metadata = {}
        self.ner_insights = {}

    def combine_insights(self, vi_insights, **kwargs) -> dict:
        """
        The function combines various insights generated from processing.
        It expects the following naming
        vi_insights - contains a processed JSON file from VI

        additional enrichments may be:
        metadata - contains a parsed metadata JSON file
        ner_insights - contains a JSON with additional parsed named entities

        All values with matching field names will be merged into a single list.
        For insights with no attached timestamp, a default timestamp will be attached
        where start = video start, end = video end
        """

        self.vi_insights = vi_insights
        video_id = vi_insights["videoId"]

        # initialize important fields
        final_document = self._init_document()

        if METADATA in kwargs:
            self.metadata = kwargs[METADATA]
            final_document = self.attach_metadata_to_document(final_document)

        if NER_INSIGHTS in kwargs:
            self.ner_insights = kwargs[NER_INSIGHTS]
            final_document = self.attach_ner_to_document(final_document)

        log.info(f"{log_text} insights for video {video_id} were combined successfully")
        return final_document

    def attach_metadata_to_document(self, document: dict) -> dict:
        """
        The code iterates over a parsed metadata JSON file and attaches known keys to vi_insights
        Returns - insights document including information from Video Indexer and Metadata
        Args:
            document (dict): The final document structure
        Returns:
            dict: The final document structure with additional metadata related fields
        """

        # Append values of locations to existing document
        for location in self.metadata.get(METADATA_LOCATION_KEY, []):
            document[VI_LOCATIONS].append(self._return_default_timestamps(location))

        # Append values of organizations to existing document
        for org in self.metadata.get(METADATA_ORG_KEY, []):
            document[VI_ORGS].append(self._return_default_timestamps(org))

        # remove the keys to avoid duplications in the document
        self.metadata.pop(METADATA_LOCATION_KEY, None)
        self.metadata.pop(METADATA_ORG_KEY, None)

        # Add all remaining keys to final document
        metadata_prefix = "metadata"
        for key, val in self.metadata.items():
            document[f"{metadata_prefix}_{key}"] = val

        return document

    def attach_ner_to_document(self, document: dict) -> dict:
        """
        This function adds insights extracted from NER processing into existing
        fields to be processed
        Args:
            document (dict): final document to combine insights to

        Returns:
            dict: he combined document to save data
        """

        for location in list(self.ner_insights.get(NER_LOCATION_KEY, [])):
            document[VI_LOCATIONS].append(self._return_default_timestamps(location))

        for person in list(self.ner_insights.get(NER_PERSON_KEY, [])):
            document[VI_PEOPLE].append(self._return_default_timestamps(person))

        for org in list(self.ner_insights.get(NER_ORG_KEY, [])):
            document[VI_ORGS].append(self._return_default_timestamps(org))

        return document

    def _return_default_timestamps(self, value_to_attach: str) -> dict:
        """
        Sets the value_to_attach to a default format for azure search

        Args:
            value_to_attach (str): A new value we want to attach to the instances
        Returns:
            dict: Structure to index in Azure search
        """
        video_duration = self.vi_insights.get("duration_in_seconds", 0)
        structured_string = DEFAULT_STRUCTURE.copy()
        structured_string["name"] = value_to_attach
        structured_string["appearances"][0][
            "endTime"
        ] = TimeParser.seconds_to_time_string(video_duration)
        structured_string["appearances"][0]["endSeconds"] = video_duration

        return structured_string

    def _init_document(self) -> dict:
        """
        Initializes important key which appears in enrichments in case they are missing from Video Indexer insights
        Returns:
            dict: basic version of the document to be indexed
        """

        final_document = self.vi_insights
        for key in [VI_PEOPLE, VI_LOCATIONS, VI_ORGS]:
            if key not in final_document:
                final_document[key] = list()

        return final_document
