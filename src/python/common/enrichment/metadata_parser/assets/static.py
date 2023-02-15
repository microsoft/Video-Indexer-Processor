"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
DEFAULT_LANGUAGE_VALUES = {'ar': 'ar-QA',
                           'en': 'en-US',
                           'fr': 'fr-FR',
                           'zh': 'zh-Hans',
                           'pt': 'pt-PT',
                           'es': 'es-ES',
                           'sr': 'sr-Cyrl-RS'
                           }

# List of mandatory fields which need to appear in each JSON file
METADATA_MANDATORY_FIELDS = ['usage_terms', 'video_description', 'first_creation_date', 'current_version_creation_date',
                             'matching_video_name', 'data_source', 'version', 'company_names', 'article_id']
