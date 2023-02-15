"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from copy import deepcopy
import pytest
from datetime import datetime
from enrichment.metadata_parser.metadata_parser import MetadataParser
from enrichment.metadata_parser.assets.static import METADATA_MANDATORY_FIELDS


@pytest.fixture
def load_parser():

    data = dict()
    for key in METADATA_MANDATORY_FIELDS:
        data[key] = 'a'
    data['keywords'] = ["keyword"]
    data['matching_video_name'] = 'my.mp4'
    return data


def test_extract_mandatory_fields_missing_video_name(load_parser):
    """The test checks if an exception is raised when matching video name key is missing
    """

    parser = MetadataParser()

    with pytest.raises(Exception) as excinfo:
        data = deepcopy(load_parser)
        data.pop('matching_video_name', None)
        parser.parse_metadata(data)
    assert "missing matching video name" in str(excinfo.value)


@pytest.mark.parametrize("mock_no_content, expected", [('version', 1),
                                                       ('first_creation_date', datetime(1700, 1, 1)),
                                                       ('data_source', 'waldo'),
                                                       ('video_description', "Missing Video Description"),
                                                       ('keywords', [])])
def test_extract_mandatory_fields_missing_keys_assert_default(load_parser, mock_no_content, expected):
    """The test check that default values are assigned when keys are missing
    """

    parser = MetadataParser()

    data = deepcopy(load_parser)
    # remove key to mock missing key use case
    data.pop(mock_no_content, None)
    parsed = parser.parse_metadata(data)
    # assert deafult data is applied when key is missing
    assert parsed[mock_no_content] == expected


@pytest.mark.parametrize("mock_no_content, expected", [({'file_name': 'my_json_file.json', 'matching_video_name': 'my_video.mp4'}, ('45fcd82b07b645790dc5d40b5665a865e085f2ba6d67fbcc8f886fcc41815799', '258750471cc9dbc5ba27bed473eba90f2bbdd7a9e67ba3d4923031378f98bd17.mp4')),
                                                       ({'matching_video_name': 'my_video.mp4'}, ('258750471cc9dbc5ba27bed473eba90f2bbdd7a9e67ba3d4923031378f98bd17', '258750471cc9dbc5ba27bed473eba90f2bbdd7a9e67ba3d4923031378f98bd17.mp4'))
                                                       ])
def test_extract_file_id(load_parser, mock_no_content, expected):
    """Validate the when file_name isn't passed, then the matching video name is used as file name
    """
    data = deepcopy(load_parser)
    parser = MetadataParser()

    for d_key, d_value in mock_no_content.items():
        data[d_key] = d_value
    parsed = parser.parse_metadata(data)
    assert all([parsed['file_id'] == expected[0], parsed['video_hash_id'] == expected[1]])


@pytest.mark.parametrize("mock_no_content, expected", [('English', 'en-US'), ('Missing Language', 'auto'), ('French and Italian', 'multi'), (None, 'auto')
                                                       ])
def test_extract_languages(load_parser, mock_no_content, expected):
    """Validate multi language transformer. Short version since we have seperate test for edge cases
    """
    data = deepcopy(load_parser)
    parser = MetadataParser()
    if mock_no_content is not None:
        data['video_languages'] = mock_no_content

    parsed = parser.parse_metadata(data)
    assert parsed['language_codes'] == expected


@pytest.mark.parametrize("mock_no_content, expected", [(['Sport', 'Politics'], ['Sport', 'Politics']), ('Sport', ['Sport'])
                                                       ])
def test_extract_keywords(load_parser, mock_no_content, expected):
    """Validate that keywords are returned as a list
    """
    data = deepcopy(load_parser)
    parser = MetadataParser()
    if mock_no_content is not None:
        data['keywords'] = mock_no_content

    parsed = parser.parse_metadata(data)
    assert parsed['keywords'] == expected


def test_extract_keywords_missing(load_parser):
    """Validate that keywords are returned as an empty list  when values are missing
    """
    data = deepcopy(load_parser)
    data.pop('keywords', None)

    parser = MetadataParser()
    parsed = parser.parse_metadata(data)
    assert parsed['keywords'] == list()
