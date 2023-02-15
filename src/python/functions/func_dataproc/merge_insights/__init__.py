"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.

Merge all insights into a single document.
The resulting document can be written to Cosmos DB for indexing.

The following insights are merged:

- Video Indexer Insights JSON
- Parsed NewsML JSON
- NER extracts from the Metadata

The function returns the new merged JSON document.
"""
import json
import logging
import os
import re

from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobClient, BlobServiceClient
from enrichment.entity_extractor.entity_extractor import (EntityExtractor,
                                                          EntityTypeConfig)
from enrichment.insights_combiner.insights_combiner import InsightsCombiner
from enrichment.vi_insights_parser.vi_insights_parser import ViInsightsParser
from shared.constants import LOG_PREFIX, STORAGE_ENV_VAR, STORAGE_TIER_SILVER


def find_latest_metadata(blobs):
    """Find the latest metadata file in a list of blobs."""
    latest_blob = None
    latest_version = 0

    for blob in blobs:
        match = re.search(r'parsed_([0-9]+)\.json', blob)
        if match:
            version = int(match.group(1))
            if version > latest_version:
                latest_version = version
                latest_blob = blob

    return latest_blob


def extract_ner(metadata):
    """Run the NER extraction process."""
    ner_extractor = EntityExtractor()
    endpoint = os.environ['TEXTANALYTICS_ENDPOINT']
    key = os.environ['TEXTANALYTICS_KEY']
    ner_extractor.initialize_client(endpoint, key)

    locations_ner_config = EntityTypeConfig('Location',
                                            threshold=0.9,
                                            add_from_metadata=['video_locations'],
                                            remove_substrings=True)

    people_ner_config = EntityTypeConfig('Person',
                                         threshold=0.85,
                                         remove_substrings=True)

    organizations_ner_config = EntityTypeConfig('Organizations',
                                                threshold=0.85,
                                                add_from_metadata=['company_names'],
                                                remove_substrings=True)

    ner_extractor.initialize_entity_type_configs([locations_ner_config, people_ner_config, organizations_ner_config])
    ner_insights = ner_extractor.extract_entities(metadata)

    return ner_insights


def main(message):
    """merge_insights Activity Function: merge all insights into a single document."""

    try:
        message_dict = json.loads(message)

        # Assemble base information
        storage_uri = os.environ[f'{STORAGE_ENV_VAR}__blobServiceUri']
        video_file_name = message_dict['matching_video_name']
        video_folder_name = video_file_name.split('.')[0]
        container_uri = f'{storage_uri}{STORAGE_TIER_SILVER}'

        # Find the latest Metadata file in the video directory
        service_client = BlobServiceClient(storage_uri, DefaultAzureCredential())
        container_client = service_client.get_container_client(STORAGE_TIER_SILVER)
        blobs = container_client.list_blobs(name_starts_with=video_folder_name)

        latest_metadata = find_latest_metadata([b.name for b in blobs])

        # Assemble URIs of the blobs to read
        vi_insights_uri = f'{container_uri}/{video_folder_name}/vi_insights.json'
        metadata_uri = f'{container_uri}/{latest_metadata}'

        # Read the files
        vi_blob_client = BlobClient.from_blob_url(vi_insights_uri, DefaultAzureCredential())
        vi_insights = vi_blob_client.download_blob().readall()

        metadata_blob_client = BlobClient.from_blob_url(metadata_uri, DefaultAzureCredential())
        metadata = json.loads(metadata_blob_client.download_blob().readall())

        # Parse the Video Indexer insights
        vi_parser = ViInsightsParser()
        parsed_vi_insights = vi_parser.parse_vi_insights(json.loads(vi_insights))

        # NER extraction
        ner_insights = extract_ner(metadata)

        # Execute the merge
        combiner = InsightsCombiner()
        final_doc = combiner.combine_insights(vi_insights=parsed_vi_insights, metadata=metadata, ner_insights=ner_insights)

        logging.info(f"{LOG_PREFIX} merged document")

        return final_doc

    except Exception:
        logging.exception(f"{LOG_PREFIX} failed to merge document")
        raise
