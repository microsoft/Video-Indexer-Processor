"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import re
import pandas as pd
from .assets.static import DEFAULT_LANGUAGE_VALUES
import os


class MultilanguageTransformation:

    def __init__(self):
        self.language_dict = list()

    def _get_language_codes(self):
        """
        This method extracts the language codes from the json in the repo and creates a dictionary. There are two types of language codes:
            - Alpha 2 which is a 2 character code used for very common language e.g. english = en, french = fr
            - Alpha 3 which is a 3 character code which every language has regardless of how much people speak it e.g tetum = tet
        The dictionary will take one or the other depending on whether an Alpha 2 code exists.
        Creates a list of all the languages that exists
        returns a dictionary of languages and their codes as well as a list on the languages
        """
        language_codes_path = f"{os.path.dirname(__file__)}/assets/language_codes.json"
        with open(language_codes_path, encoding="utf8") as f:
            language_codes_json = json.load(f)
        lang_dict = {}
        for code in language_codes_json['language_codes']:
            code_name = code['alpha_2'] if 'alpha_2' in code else code['alpha_3']
            lang_dict[code['name'].lower()] = code_name

        self.language_set = list(lang_dict.keys())
        return lang_dict

    def clean_video_language(self, video_language):
        """
        In this method we extract the languages if any from the video_language string that we get from the json file.
        First by cleaning the string, there are cases where common words such as 'english' are spelt incorrectly.
        Then we extract the known languages into a list if there are any present using the list of languages (languages_set).
        In the case there is nothing useful in the original string, we create a list with 'No language'
        returns list of strings
        """
        video_language = video_language.lower()
        if video_language != '':
            video_language = video_language.lower()
            video_language = re.sub(
                'englsih|englsihspeech', 'english', video_language)
            video_language = re.sub(
                'turksih', 'turkish', video_language)
            video_language = re.sub('speechh|speech|part', '', video_language)
            video_language = re.sub('-|,|//|/|&', ' ', video_language)
            video_language = re.sub('(.)\1+', '', video_language)
            list_languages = list(
                set(video_language.lower().split(' ')) & set(self.language_set))
        else:
            list_languages = ['No Language']
        return list_languages

    def categorizing_multi_language_code(self, list_languages):
        """
        This method categorizes the newly cleaned video_language string so that the Azure Video Indexer api can be updated with the correct language setting:
            - If list_languages has a len of more than 1 we know there are multiple languages so we return 'multi'
            - If we get a list that isn't empty and doesn't have 'no language', we assume there is one language in the video and we check if the language appears in the dictionary.
                - if the language is present we return the code, if not we return 'auto' so Azure Video Indexer can do autodetection
            -In all other cases such as 'No language' , [], etc, we return 'auto'
        """
        if len(list_languages) > 1:
            language_code_res = 'multi'
        elif len(list_languages) == 1:
            language_code_res = self.language_dict.get(list_languages[0].lower(
            )) if list_languages[0].lower() in self.language_dict else 'auto'
        else:
            language_code_res = 'auto'
        return language_code_res

    def language_code_to_avam_code(self, language_code: str) -> str:
        """
            The function converts 2 letter codes to Azure Video Indexer supported languages
        Args:
            language_code (str): 2/3/ language codes parsed from string

        Returns:
            str: Azure Video Indexer supported language-locale format
        """
        path_to_avam_supported_languages = f"{os.path.dirname(__file__)}/assets/vi_supported_languages.csv"

        # Return the default predefined languages for languages with multiple locals
        if language_code in DEFAULT_LANGUAGE_VALUES:
            return DEFAULT_LANGUAGE_VALUES[language_code]

        if language_code in ('auto', 'multi'):
            return language_code

        # For non default values, parse the Azure Video Indexer code
        vi_supported_languages = pd.read_csv(path_to_avam_supported_languages)
        # parse language-locale format into 2/3 letter code
        vi_supported_languages['language_code'] = vi_supported_languages['LanguageCodeLocale'].apply(
            lambda x: x.split('-')[0])
        vi_supported_dict = vi_supported_languages[[
            'language_code', 'LanguageCodeLocale']].set_index('language_code').to_dict()
        return vi_supported_dict['LanguageCodeLocale'].get(language_code, 'auto')

    def language_string_to_language_code(self, video_language: str) -> str:
        """
        This function receives the video language string as identified in the metadata file and returns a 2 letter language code
        Args:
            video_language (str): String representing languages in video's audio
        Returns:
            str: 2 or 3 letter language code
        """
        # initialize all available language codes, #TODO: how do we add additional languages to the file?
        self.language_dict = self._get_language_codes()

        # clean the string
        language_list = self.clean_video_language(video_language)
        # match letter code
        language_code = self.categorizing_multi_language_code(language_list)

        # convert language code to one of Azure Video Indexer supported locales
        return self.language_code_to_avam_code(language_code)
