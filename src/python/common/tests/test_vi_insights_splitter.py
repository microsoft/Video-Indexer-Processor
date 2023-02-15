"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from copy import deepcopy
from typing import OrderedDict
import pytest
from enrichment.insights_splitter.insights_to_segments_splitter import VIinsightsToSegmentsSplitter
import json
from tests.assets.tests_vi_insights_parser import EXPECTED_INSIGHTS, SPLIT_SCENES, INFO_PIECE


def read_json_file(location):
    # Opening JSON file
    f = open(location, "r")
    # returns JSON object as a dictionary
    data = json.load(f)
    return data


@pytest.fixture(scope="session", autouse=True)
def load_configuration():
    config_path = 'common/enrichment/insights_splitter/splitter_configuration.jsonc'
    configuration = read_json_file(config_path)
    return configuration


@pytest.fixture
def load_splitter(load_configuration):
    parser = VIinsightsToSegmentsSplitter(load_configuration)
    return parser


@pytest.mark.parametrize("param", [('interval'),
                                   ('15'), (None), (5.6), (-4)
                                   ])
def test_is_config_valid_should_raise(load_splitter, param):
    """
        The code validates that interval_duration is integer and raises an Exception in any other case.
        This test should raise an exception
    """

    with pytest.raises(Exception):
        splitter = deepcopy(load_splitter)
        splitter.interval_duration = param
        splitter._is_config_valid()


@pytest.mark.parametrize("param", [(10), (100)
                                   ])
def test_is_config_valid_valid(load_splitter, param):
    """
        The code validates that interval_duration is integer and raises an Exception in any other case.
        This test should return True
    """

    splitter = deepcopy(load_splitter)
    splitter.interval_duration = param
    res = splitter._is_config_valid()
    assert res is True


def test_return_single_element(load_splitter):
    """
        The code validates that interval_duration is integer and raises an Exception in any other case.
        This test should return True
    """
    vi_insights = deepcopy(EXPECTED_INSIGHTS)
    splitter = deepcopy(load_splitter)
    res = splitter._return_single_segment(vi_insights, 120)

    # The only key should be time 0 seconds
    assert 0 in res.keys()
    # There should be only 1 segment in the result set
    assert len(list(res.keys())) == 1
    # The content of the segment should be equal to the original insights
    assert res[0] == vi_insights


@pytest.mark.parametrize("segment_type, interval_duration, expected", [('interval', 130, 1),  # longer than duration, should be 1 segment
                                                                       ('interval', 60, 3),  # The last second doesn't count, so a 3rd segment should be created
                                                                       ('interval', 65, 2),  # 120 seconds are split across 2 segments, where the second is shorter
                                                                       ('scenes', 65, 1),  # There is 1 scene in the example
                                                                       ('shots', 65, 2)  # There are 2 shots in the example
                                                                       ]
                         )
def test_initialize_segments(load_splitter, segment_type, interval_duration, expected):
    """
        This code initializes the segments into the correct number of bins.
        The expected number represents the number of bins which should be created based on the provided vi_insights template
    """

    vi_insights = deepcopy(SPLIT_SCENES)
    splitter = deepcopy(load_splitter)
    splitter.interval_duration = interval_duration
    res = splitter._initialize_segments(vi_insights, segment_type)
    assert len(list(res.keys())) == expected


@pytest.mark.parametrize("segment_keys, instance, expected", [
                        ([0], {"start": "0:00:01.001", "end": "0:00:01.03"}, 0),
                        ([0, 5, 10], {"start": "0:00:06.01", "end": "0:00:12.0"}, 5),
                        ([0, 5, 10], {"start": "0:00:03.01", "end": "0:00:12.0"}, 0),
                        ([0, 5, 10], {"start": "0:00:12.01", "end": "0:00:15.0"}, 10),
                        ([0, 5, 10], {"start": "0:00:05.00", "end": "0:00:08.0"}, 5),
                        ([0, 5, 10], {"start": "0:00:04.03", "end": "0:00:08.0"}, 0),
]
)
def test_split_key_insights_first(load_splitter, segment_keys, instance, expected):
    """The code verifies the assignment of instances into the first relevant bin
    """
    splitter = deepcopy(load_splitter)
    key_name = 'labels'
    info_piece = INFO_PIECE

    # initialize segments with segment keys
    segments = OrderedDict()
    for key in segment_keys:
        segments[key] = {'videos': [{'insights': {}}]}

    result = splitter._split_key_insights_first(segments=segments,
                                                segment_keys=segment_keys,
                                                key=key_name,
                                                instance=instance,
                                                info_piece=info_piece)
    # make sure only the first relevant bin is filled
    assert result[expected]['videos'][0]['insights'][key_name][0] == info_piece

    # make sure all other bins are empty
    other_keys = set(segment_keys) - set([expected])
    for other_key in other_keys:
        assert key_name not in result[other_key]['videos'][0]['insights']


@pytest.mark.parametrize("segment_keys, instance, expected", [
                        ([0], {"start": "0:00:01.001", "end": "0:00:01.03"}, [0]),
                        ([0, 5, 10], {"start": "0:00:06.01", "end": "0:00:12.0"}, [5, 10]),
                        ([0, 5, 10], {"start": "0:00:03.01", "end": "0:00:12.0"}, [0, 5, 10]),
                        ([0, 5, 10], {"start": "0:00:12.01", "end": "0:00:15.0"}, [10]),
                        ([0, 5, 10], {"start": "0:00:05.00", "end": "0:00:08.0"}, [5]),
                        ([0, 5, 10], {"start": "0:00:04.03", "end": "0:00:08.0"}, [0, 5]),
]
)
def test_split_key_insights_duplicate(load_splitter, segment_keys, instance, expected):
    """The code verifies the assignment of instances into the all relevant bins spanning over the instance
    """
    splitter = deepcopy(load_splitter)
    key_name = 'labels'
    info_piece = INFO_PIECE

    # initialize segments with segment keys
    segments = OrderedDict()
    for key in segment_keys:
        segments[key] = {'videos': [{'insights': {}}]}

    result = splitter._split_key_insights_duplicate(segments=segments,
                                                    segment_keys=segment_keys,
                                                    key=key_name,
                                                    instance=instance,
                                                    info_piece=info_piece)

    for bin_ind in expected:
        # make sure all relevant bins are filled
        assert result[bin_ind]['videos'][0]['insights'][key_name][0] == info_piece

    # make sure all other bins are empty
    other_keys = set(segment_keys) - set(expected)
    for other_key in other_keys:
        assert key_name not in result[other_key]['videos'][0]['insights']
