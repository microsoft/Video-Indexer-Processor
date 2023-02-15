"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from setuptools import setup, find_packages

setup(
    name='enrichment',
    version='0.0.1',
    author='Microsoft CSE',
    packages=find_packages(),
    package_data={
        'metadata_parser.assets': ['language_codes.json', 'vi_supported_languages.csv'],
        'entity_extractor.assets:': ['acromyns_lib_congress.json', 'caps_exeptions.json']

    },
    include_package_data=True,
    data_files=[
        ('metadata_parser', ['enrichment/metadata_parser/assets/language_codes.json', 'enrichment/metadata_parser/assets/vi_supported_languages.csv']),
        ('entity_extractor', ['enrichment/entity_extractor/assets/acromyns_lib_congress.json', 'enrichment/entity_extractor/assets/caps_exeptions.json']),
        ('insights_splitter', ['enrichment/insights_splitter/splitter_configuration.jsonc'])
    ],
    install_requires=[
        "pandas",
        "azure-storage-blob",
        "azure-core",
        "python-dateutil",
        "azure-search",
        "azure-search-documents",
        "azure-ai-textanalytics"
    ],
)
