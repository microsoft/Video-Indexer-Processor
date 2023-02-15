"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.

Blob trigger for uploaded videos.
This Function triggers when a new JSON file is written in the upload ingest container.

It performs the following:

- Add any necessary properties to the input JSON to make it compatible with
  expected JSON data used in the data processing pipelines.
- Save the JSON in the Silver data store.
- Send a message to the extract queue to trigger the rest of the process.

The trigger will add the following fields to the JSON object:

- article_id: same as the ingest folder unique name.
- video_hash_id: hash of the mp4 file name.
- file_name: the name of the input JSON file.
- file_id: hash of the data file name.
- language_codes: the language codes identified in the video_languages string.

The trigger will modify the following fields:

- matching_video_name: will append the article_id to make sure it is unique.
"""

import json
import logging
import os

import azure.functions as func
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobClient
from enrichment.metadata_parser.metadata_parser import MetadataParser

PREFIX = os.environ['LOG_PREFIX']
LOG_PREFIX = f'{PREFIX}[trigger-upload]'

DEFAULT_DATA_SOURCE = 'manual'

SOURCE_STORAGE_ENV_VAR = 'UploadStorage'
DEST_STORAGE_ENV_VAR = 'DataStorage'


def main(blob: func.InputStream, msg: func.Out[str]):
    """Main Function method."""
    logging.info(f"{LOG_PREFIX} processing new JSON file: %s", blob.name)

    source_storage = os.environ[f"{SOURCE_STORAGE_ENV_VAR}__blobServiceUri"]
    dest_storage = os.environ[f"{DEST_STORAGE_ENV_VAR}__blobServiceUri"]
    silver_container = os.environ['SILVER_CONTAINER']
    upload_container = os.environ['UPLOAD_CONTAINER']

    try:
        # Read the incoming blob data
        json_data = json.loads(blob.read())

        logging.info(f"{LOG_PREFIX} loaded JSON file: {blob.name}")

    except Exception:
        logging.exception(f"{LOG_PREFIX} failed loading JSON file {blob.name}")
        raise

    # Gather values from input JSON and blob
    # Incoming blob names format: {datasource}/{uid}/{name}.json
    (source_container, datasource, source_folder, source_file_name) = blob.name.split('/')

    # parse raw blob and calculate necessary metadata
    parser = MetadataParser()

    video_file_name = json_data['matching_video_name']
    (video_base_name, video_extension) = video_file_name.split('.')

    # We only support one version for manually uploaded data
    video_version = json_data.get('version', 1)

    # Set data source
    json_data['data_source'] = json_data.get('data_source', DEFAULT_DATA_SOURCE)
    if datasource != json_data['data_source']:
        logging.error(f"{LOG_PREFIX} incoherent data source in {blob.name}: {datasource} vs {json_data['data_source']}")
        raise ValueError("Incoherent data source")

    # Generate missing properties
    # The unique source folder name is used as article_id
    article_id = source_folder
    json_data['article_id'] = article_id
    json_data['file_name'] = source_file_name

    # Make matching_video_name unique
    unique_video_name = video_base_name + '_' + article_id
    json_data['matching_video_name'] = f'{unique_video_name}.{video_extension}'

    # Generate hashes and language codes
    json_data = parser.parse_metadata(json_data)

    # Add properties required for data processing
    json_data['matching_video_url'] = f'{source_storage}{upload_container}/{datasource}/{source_folder}/{video_file_name}'

    # Save data to storage
    json_data_str = json.dumps(json_data, default=str)

    try:
        # Write the parsed JSON
        dest_blob_uri = f'{dest_storage}{silver_container}/{unique_video_name}/parsed_{video_version}.json'
        blob_client = BlobClient.from_blob_url(dest_blob_uri, DefaultAzureCredential())
        blob_client.upload_blob(json_data_str, overwrite=True)

        logging.info(f"{LOG_PREFIX} wrote JSON file: {dest_blob_uri}")

        # Set the parser result as the queue message
        msg.set(json_data_str)

    except Exception:
        logging.exception(f"{LOG_PREFIX} file save failed for {video_file_name}")
        raise
