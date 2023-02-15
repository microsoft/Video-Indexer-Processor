"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import pytest
from enrichment.entity_extractor.utils import remove_substring_elements
from enrichment.entity_extractor.utils import perform_capitalize_propernouns


@pytest.mark.parametrize(
    "test_input, expected_output",
    [
        (set([]), set([])),
        (set(["a", "b"]), set(["a", "b"])),
        (set(["a", "aa"]), set(["aa"])),
        (set(["a", ""]), set(["a"])),
        (
            set(["adam lambert", "adam", "michael", "michael jackson"]),
            set(["adam lambert", "michael jackson"]),
        ),
        (
            set(["john doe", "doe"]),
            set(["john doe"]),
        ),
        (set(["alice fisher", "fisher"]), set(["alice fisher"])),
    ],
)
def test_remove_substring_elements(test_input, expected_output):
    assert remove_substring_elements(test_input) == expected_output


@pytest.mark.parametrize(
    "test_input, expected_output",
    [
        ({"paris"}, {"Paris"}),
        ({"united nations"}, {"United Nations"}),
        ({"microsoft"}, {"Microsoft"}),
        ({"nato"}, {"NATO"}),
        ({"usa"}, {"USA"}),
        ({"great britain"}, {"Great Britain"}),
        ({"ministry of defense"}, {"Ministry of Defense"}),
        ({"microsoft", "nato"}, {"Microsoft", "NATO"}),
        ({"bosnia and herzegovina"}, {"Bosnia and Herzegovina"}),
        ({"irs"}, {"IRS"}),
        ({"the"}, {"the"}),
        ({"los"}, {"Los"}),
        ({""}, {""}),
        (set(), set())
    ],
)
def test_smart_capitalize_entities(test_input, expected_output):
    assert perform_capitalize_propernouns(test_input) == expected_output
