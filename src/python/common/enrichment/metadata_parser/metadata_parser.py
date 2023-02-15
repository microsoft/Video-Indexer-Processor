"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from .multilanguage_transformer import MultilanguageTransformation
from dataclasses import dataclass
from datetime import datetime
from functools import reduce
from .assets.static import METADATA_MANDATORY_FIELDS
import hashlib
import logging as log
import os


log_text = os.getenv("LOG_PREFIX")
DEFAULT_DATE = datetime(1700, 1, 1)


@dataclass
class MetadataParser:
    """Class for extracting metadata files to start Video processing"""

    def __init__(self):
        """
        Initialize JSON metadata, parses the nested keys into manageable metadata.
        """
        self._file_id = None
        self._video_hash_id = None
        self._json_data = None
        self.keywords = list()
        self.video_description = "Missing Video Description"
        self.first_creation_date = DEFAULT_DATE
        self.current_version_creation_date = DEFAULT_DATE
        self.video_languages = list()
        self.video_locations = list()
        self.version = 1
        self.usage_terms = None
        self._file_name = None
        self.company_names = list()
        self.multi_lang_transformer = MultilanguageTransformation()
        self.data_source = 'waldo'
        self.article_id = None

    def extract_mandatory_fields(self):
        """
        The function converts string file_name into a unique hash ID
        """

        mandatory_fields = METADATA_MANDATORY_FIELDS

        for key in mandatory_fields:
            if key not in self._json_data:
                if key == 'matching_video_name':
                    log.error(f'Json file does not contain {key}, unable to proceed')
                    raise Exception(f"{log_text} file {self._file_name} is missing matching video name")
                log.warning(f"{log_text} missing key {key}, setting default value")
                continue
            setattr(self, key, self._json_data[key])

        self._extract_file_id()

    def _extract_file_id(self):
        """
        The function converts string file_name into a unique hash ID
        """
        self._video_file_name_to_hashid()
        self._json_file_name_to_hashid()

    @property
    def video_hash_id(self) -> str:
        return self._video_hash_id

    @property
    def file_id(self) -> str:
        return self._file_id

    @property
    def file_name(self) -> str:
        return self._file_name

    def _string_to_hash(self, string_name: str) -> str:
        file_id = hashlib.sha256(
            str(string_name).encode("utf-8")).hexdigest()[:75]
        return file_id

    def _video_file_name_to_hashid(self):
        """
        Convert unique file name to hashid for Video Indexer upload purposes
        """
        split_file = self.matching_video_name.split(".")
        video_name = split_file[0]
        file_type = split_file[1]

        video_file_id = self._string_to_hash(video_name)
        self._video_hash_id = video_file_id + f".{file_type}"

    def _json_file_name_to_hashid(self):
        """
        Extract the Json file name. If the key 'file_name' is present, then use it as the Json file name, if the key is missing,
        Use the matching video name file as the file_name
        """
        file_name = self._json_data.get('file_name', self.matching_video_name.split(".")[0])
        self._file_name = file_name
        self._file_id = self._string_to_hash(file_name)

    @staticmethod
    def deep_get(dictionary, *keys):
        """
        Return nested keys for a dictionary
        """
        return reduce(
            lambda dictionary, key: dictionary.get(key, f"no key {key}")
            if isinstance(dictionary, dict)
            else f"no key {key}",
            keys,
            dictionary,
        )

    def extract_video_languages(self):
        """
            Extract language name and code based on provided string
        """
        keys = ["video_languages"]
        video_languages = MetadataParser.deep_get(self._json_data, *keys)

        if 'no key' in video_languages:
            log.warning(f"{log_text} missing language description for file {self._file_name}")
            self.video_languages = "No Language Information"
            self.language_codes = "auto"
            return

        self.video_languages = video_languages

        # convert language string to Azure Video Indexer language code
        self.language_codes = self.multi_lang_transformer.language_string_to_language_code(
            self.video_languages)

    def extract_keywords(self):
        """
            The function generates a list of video keywords
        """
        keys = ["keywords"]
        topics_list = MetadataParser.deep_get(self._json_data, *keys)

        if 'no key' in topics_list:
            log.warning(f"{log_text} no keywords for file {self._file_name}")
            return

        # when single value
        if isinstance(topics_list, list):
            self.keywords = topics_list
        else:
            self.keywords = [topics_list]

    def parse_metadata(self, json_data: dict) -> dict:
        """
        parses all the needed metadata into a flat dictionary

        """
        self._json_data = json_data
        parsed = self._execute_extraction_functions()
        return parsed

    def _execute_extraction_functions(self,) -> dict:
        """
            Exexcuts all methods starting with "extract" and removes all non data class properties
        """

        extraction_functions = [x for x in dir(
            self) if x.startswith("extract")]

        # execute the extractions functions
        for name in extraction_functions:
            method = getattr(self, name)
            method()

        # convert the method attributes into a json object and return it
        json_data = self._to_json()
        return json_data

    def _to_json(self) -> dict:
        """
        Converts all the properties into JSON object
        """
        json_dict = {}
        for key, value in self.__dict__.items():
            if not key.startswith("_"):
                json_dict[key] = value

        # remove keys which will not be searched
        json_dict.pop("multi_lang_transformer", None)
        json_dict["file_name"] = self.file_name
        json_dict['file_id'] = self.file_id
        json_dict['video_hash_id'] = self.video_hash_id
        return json_dict
