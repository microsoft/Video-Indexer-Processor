"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import logging

import azure.functions as func
from shared.constants import LOG_PREFIX


def main(message, document: func.Out[func.Document]):
    """write_insights Activity Function: write insights doc to Cosmos DB."""

    try:
        video_id = message['videoId']
        message['id'] = video_id
        document.set(func.Document.from_dict(message))
        logging.info(f"{LOG_PREFIX} wrote doc to Cosmos DB for {video_id}")
        return True
    except Exception:
        logging.exception(f"{LOG_PREFIX} failed to write doc to Cosmos DB")
        raise
