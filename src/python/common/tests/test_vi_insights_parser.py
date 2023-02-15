"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import pytest
from enrichment.vi_insights_parser.vi_insights_parser import ViInsightsParser
from tests.assets.tests_vi_insights_parser import *


@pytest.mark.parametrize(
    "mock_content, expected", EXPECTED_INSIGHTS)
def test_parse_vi_insights(mock_content, expected):
    """The test checks if identical vectors return the same distribution result"""
    parser = ViInsightsParser()
    parsed = parser.parse_vi_insights(mock_content)

    assert set(parsed) == set(expected)


@pytest.mark.parametrize(
    "mock_no_content, expected", NO_CONTENT)
def test_parse_vi_insights_no_content(mock_no_content, expected):
    """The test checks if identical vectors return the same distribution result"""
    parser = ViInsightsParser()
    parsed = parser.parse_vi_insights(mock_no_content)

    assert set(parsed) == set(expected)


@pytest.mark.parametrize(
    "mock_content, expected", MULTI_LANGUAGE)
def test_multilanguage_handling(mock_content, expected):
    """The test checks if identical vectors return the same distribution result"""
    parser = ViInsightsParser()
    parsed = parser.parse_vi_insights(mock_content)

    assert set(parsed) == set(expected)


@pytest.mark.parametrize(
    "mock_content, expected", INSIGHTS_WITH_SOME_NAMES_TO_EXTRACT)
def test_extract_names_with_some_missing(mock_content, expected):
    """Check if names are extracted properly for semantic search, with some elements having this field missing."""
    parser = ViInsightsParser()
    parsed = parser.parse_vi_insights(mock_content)

    assert set(parsed) == set(expected)


@pytest.mark.parametrize(
    "mock_content, expected", INSIGHTS_WITH_ALL_NAMES_TO_EXTRACT)
def test_extract_names_without_any_missing(mock_content, expected):
    """Check if names are extracted properly for semantic search, with all elements having this field present."""
    parser = ViInsightsParser()
    parsed = parser.parse_vi_insights(mock_content)

    assert set(parsed) == set(expected)
