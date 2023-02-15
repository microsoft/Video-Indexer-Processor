"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import os
from unittest import mock

import pytest
from azure.storage.blob import BlobClient, BlobProperties

with mock.patch.dict(os.environ, {'LOG_PREFIX': 'prefix'}):
    from merge_insights import main

MOCK_BLOBS_1 = [
    BlobProperties(name='FOOBAR/parsed_1.json'),
    BlobProperties(name='FOOBAR/parsed_2.json'),
    BlobProperties(name='FOOBAR/parsed_3.json')
]

MOCK_BLOBS_2 = [
    BlobProperties(name='FOOBAR/parsed_3.json'),
    BlobProperties(name='FOOBAR/parsed_2.json'),
    BlobProperties(name='FOOBAR/parsed_1.json')
]

BLOB_EXPECTED = 'foo/silver/FOOBAR/parsed_3.json'


@mock.patch.dict(os.environ, {'DataStorage__blobServiceUri': 'foo/'})
@mock.patch.dict(os.environ, {'TEXTANALYTICS_ENDPOINT': 'fake'})
@mock.patch.dict(os.environ, {'TEXTANALYTICS_KEY': 'foo'})
@mock.patch('merge_insights.BlobServiceClient')
@mock.patch.object(BlobClient, 'from_blob_url')
@pytest.mark.parametrize('blob_list, blob_expected', [(MOCK_BLOBS_1, BLOB_EXPECTED), (MOCK_BLOBS_2, BLOB_EXPECTED)])
def test_merge_insights(mock_blob, mock_service, blob_list, blob_expected):

    message = {'matching_video_name': 'FOOBAR.MP4'}

    mock_service.return_value.get_container_client.return_value.list_blobs.return_value = blob_list

    with open('tests/vi_insights.json') as f:
        vi_insights = f.read()

    mock_blob.return_value.download_blob.return_value.readall.return_value = vi_insights

    main(json.dumps(message))

    mock_service.assert_called_once()
    assert mock_blob.call_count == 2
    assert mock_blob.call_args.args[0] == blob_expected
