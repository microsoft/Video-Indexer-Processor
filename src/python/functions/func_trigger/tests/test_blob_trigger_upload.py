"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import os
from unittest.mock import MagicMock, patch

from azure.storage.blob import BlobClient

with patch.dict(os.environ, {'LOG_PREFIX': 'prefix'}):
    from blob_trigger_upload import main


@patch.dict(os.environ, {'UploadStorage__blobServiceUri': 'http://foo/'})
@patch.dict(os.environ, {'DataStorage__blobServiceUri': 'http://bar/'})
@patch.dict(os.environ, {'SILVER_CONTAINER': 'silver'})
@patch.dict(os.environ, {'UPLOAD_CONTAINER': 'upload'})
@patch.object(BlobClient, 'from_blob_url')
def test_blob_trigger_upload(mock_blob_client):
    """Test that blob_trigger_upload saves data to storage and posts a message to the queue."""
    with open('tests/upload.json') as f:
        upload_json = f.read()

    blob = MagicMock()
    blob.read.return_value = upload_json
    blob.name = 'upload/datasource/abc123/data.json'

    msg = MagicMock()

    main(blob, msg)

    # Test the from_blob_url() call
    assert mock_blob_client.called_once()
    assert 'test_video' in mock_blob_client.call_args[0][0]

    # Test the upload_blob() call
    assert mock_blob_client.return_value.upload_blob.call_count == 1
    blob_contents = json.loads(mock_blob_client.return_value.upload_blob.call_args[0][0])
    assert blob_contents['matching_video_url'] == 'http://foo/upload/datasource/abc123/test_video.mov'
    article_id = blob_contents['article_id']
    assert article_id == 'abc123'
    assert blob_contents['file_name'] == "data.json"
    assert blob_contents['matching_video_name'] == "test_video_abc123.mov"

    msg.set.assert_called_once()
