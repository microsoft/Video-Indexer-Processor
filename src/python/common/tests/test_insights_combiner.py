"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from copy import deepcopy
from enrichment.insights_combiner.insights_combiner import InsightsCombiner
from enrichment.insights_splitter.time_parser import TimeParser
import pytest


@pytest.fixture
def init_combiner() -> InsightsCombiner:
    """Initializes a mock sample of a combiner to be reused in all the tests"""
    combiner = InsightsCombiner()
    combiner.vi_insights = {"duration_in_seconds": 45, "videoId": "abc123"}
    return combiner


def load_default_document(init_combiner):
    combiner = deepcopy(init_combiner)
    document = combiner._init_document()
    return document


@pytest.mark.parametrize(
    "seconds, expected",
    [(0, "00:00:00"), (59, "00:00:59"), (61, "00:01:01"), (3602, "01:00:02")],
)
def test_seconds_to_time_string(seconds, expected):
    """The test checks if numerical second conversion to string is correct"""
    seconds_string = TimeParser.seconds_to_time_string(seconds)
    assert seconds_string == expected


@pytest.mark.parametrize(
    "seconds, value_to_attach, expected",
    [
        (0, "Japan", "00:00:00"),
        (59, "Michael", "00:00:59"),
        (61, "MSFT", "00:01:01"),
        (3602, "MSFT", "01:00:02"),
    ],
)
def test_return_default_timestamps(init_combiner, seconds, value_to_attach, expected):
    """The test checks if the default timestamps attached to insights without a timestamp work"""
    # initialize test
    combiner = deepcopy(init_combiner)
    combiner.vi_insights["duration_in_seconds"] = seconds
    struct = combiner._return_default_timestamps(value_to_attach)

    # parse results to make answer simpler to read
    parsed_string = struct["appearances"][0]["endTime"]
    parsed_seconds = struct["appearances"][0]["endSeconds"]
    parsed_value = struct["name"]
    assert all(
        [
            parsed_string == expected,
            parsed_seconds == seconds,
            parsed_value == value_to_attach,
        ]
    )


@pytest.mark.parametrize(
    "ner_enrichment, expected",
    [({"Location": {"a"}}, "a"), ({"Location": {"b", "a"}}, "b")],
)
def test_attach_ner_to_document(init_combiner, ner_enrichment: dict, expected: dict):
    """
    Args:
        ner_enrichment (dict): NER entichment in form of dictionary
        document (dict): the final version of a document
        expected (dict): Enriched expected result
    """
    combiner = deepcopy(init_combiner)
    default_document = load_default_document(combiner)
    combiner.ner_insights = ner_enrichment
    enriched_document = combiner.attach_ner_to_document(default_document)

    # Make sure that for each use case at least one of the additional values is added.
    # This is due to the fact the dictionaries don't maintain
    # a consistent order. We can change it to ordered dict in the future
    matching_locations = [
        x["name"] for x in enriched_document["named_locations"] if x["name"] == expected
    ]
    assert len(matching_locations) == 1


@pytest.mark.parametrize("ner_enrichment, expected", [({"Location": {}}, 0)])
def test_attach_ner_to_document_no_values(
    init_combiner, ner_enrichment: dict, expected: dict
):
    """
    Args:
        ner_enrichment (dict): NER enrichment in the form of dictionary
        document (dict): the final version of a document
        expected (dict): Enriched expected result
    """
    combiner = deepcopy(init_combiner)
    default_document = load_default_document(combiner)
    combiner.ner_insights = ner_enrichment
    enriched_document = combiner.attach_ner_to_document(default_document)
    assert len(enriched_document["named_locations"]) == expected


@pytest.mark.parametrize(
    "ner_enrichment, expected", [({"Location": {"a"}, "Persons": {"n"}}, 0)]
)
def test_attach_ner_to_document_bad_key(
    init_combiner, ner_enrichment: dict, expected: dict
):
    """
    Args:
        ner_enrichment (dict):NER enrichment in the form of dictionary
        document (dict): the final version of a document
        expected (dict): Enriched expected result
    """
    combiner = deepcopy(init_combiner)
    default_document = load_default_document(combiner)
    combiner.ner_insights = ner_enrichment
    enriched_document = combiner.attach_ner_to_document(default_document)
    assert len(enriched_document["named_people"]) == expected


@pytest.mark.parametrize(
    "ner_enrichment, expected", [({"Location": {"a"}, "Persons": {"n"}}, 0)]
)
def test_attach_ner_to_document_multiple_keys(
    init_combiner, ner_enrichment: dict, expected: dict
):
    """
    Args:
        ner_enrichment (dict): NER enrichment in the form of dictionary
        document (dict): the final version of a document
        expected (dict): Enriched expected result
    """
    combiner = deepcopy(init_combiner)
    default_document = load_default_document(combiner)
    combiner.ner_insights = ner_enrichment
    enriched_document = combiner.attach_ner_to_document(default_document)
    assert len(enriched_document["named_people"]) == expected


@pytest.mark.parametrize(
    "metadata, expected",
    [({"company_names": ["a"]}, 1), ({"company_names": ["b", "a"]}, 2)],
)
def test_attach_metadata_to_document(
    init_combiner, metadata: dict, expected: dict
):
    """
    Args:
        metadata (dict): Parsed metadata
        expected (dict): Enriched expected result
    """
    default_document = load_default_document(init_combiner)
    combiner = deepcopy(init_combiner)
    combiner.metadata = metadata

    enriched_document = combiner.attach_metadata_to_document(default_document)
    assert len(enriched_document["named_organizations"]) == expected


@pytest.mark.parametrize(
    "metadata, expected",
    [({"company_names": ["a"]}, 2), ({"company_names": ["b", "a"]}, 3)],
)
def test_attach_metadata_to_document_makesure_keys_are_popped(
    init_combiner, metadata: dict, expected: dict
):
    """Make sure keys are popped from original insights so that there is no key overwrite

    Args:
        metadata (dict): Parsed metadata
        expected (dict): Enriched expected result
    """
    default_document = load_default_document(init_combiner)
    default_document["named_organizations"] = ["v"]
    combiner = deepcopy(init_combiner)
    combiner.metadata = metadata
    enriched_document = combiner.attach_metadata_to_document(default_document)
    assert all(
        [
            "company_names" not in combiner.metadata,
            len(enriched_document["named_organizations"]) == expected,
        ]
    )


@pytest.mark.parametrize(
    "metadata",
    [({"company_names": ["a"], "headline": "cool"})],
)
def test_attach_metadata_to_document_additional_fields(
    init_combiner, metadata: dict
):
    """
    Make sure additional fields are created with a prefix to indicate the source

    Args:
        metadata (dict): Parsed metadata
        expected (dict): Enriched expected result
    """
    combiner = deepcopy(init_combiner)
    default_document = load_default_document(combiner)
    default_document["named_organizations"] = ["v"]
    combiner.metadata = metadata
    enriched_document = combiner.attach_metadata_to_document(default_document)
    assert "metadata_headline" in enriched_document


@pytest.mark.parametrize(
    "metadata, ner_enrichment, expected",
    [({"company_names": ["a", "b"]}, {"Organizations": {"c"}}, 3)],
)
def test_attach_combine_insights(
    init_combiner, metadata: dict, ner_enrichment: dict, expected: dict
):
    """
    End to End test
    Returns True if organizations from all 3 sources are merged correctly and not overwriting each other

    Args:
        metadata (dict): Parsed metadata
        ner_enrichment (dict): NER extraction
        expected (dict): Enriched expected result
    """
    combiner = deepcopy(init_combiner)
    enriched_document = combiner.combine_insights(
        vi_insights={"videoId": "abc1123", "duration_in_seconds": 45},
        ner_insights=ner_enrichment,
        metadata=metadata,
    )
    assert len(enriched_document["named_organizations"]) == expected
