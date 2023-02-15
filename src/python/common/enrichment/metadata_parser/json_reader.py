"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import logging as log
from azure.core.exceptions import ResourceNotFoundError
from azure.storage.blob import ContainerClient
from typing import Union
import os

log_text = os.getenv("LOG_PREFIX")


def json_reader(container_client: ContainerClient, file_name: str) -> Union[dict, str]:
    """
        The Function recieves a file_name of a file located in Blob storage and returns the file in dictionary representation
    Args:
        container_client (ContainerClient): ContainerClinet authenticated to spesific storage
        file_name (str): Name of the Blob we want to read

    Returns:
        dict: Dictionary representation of Json blob file
    """
    if not file_name.lower().endswith('json'):
        log.error(f"{log_text} file name: {file_name} is not an JSON file")
        return None

    blob_client = container_client.get_blob_client(file_name)
    try:
        json_file = blob_client.download_blob()
    except ResourceNotFoundError as e:
        log.error(
            f"{log_text} file: {file_name} not found in container: {blob_client.container_name}, {e}")
        return None

    json_file = json_file.readall()
    return json.loads(json_file)
