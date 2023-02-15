"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import pytest
import enrichment.entity_extractor.entity_extractor as entity_extractor
from azure.ai.textanalytics import CategorizedEntity


@pytest.mark.parametrize("dictionary, interesting_fields, expected_output", [
    ({}, [], []),
    ({'key1': 'content1'}, [], []),
    ({'key1': 'content1'}, ['key2'], []),
    ({'key1': 'content1', 'key2': 'content2'}, ['key1'], ['content1']),
    ({'key1': 'content1', 'key2': 'content2', 'key3': 'content3'}, ['key1', 'key3'], ['content1', 'content3']),
    ({'key1': ['part1', 'part2'], 'key2': 'content2', 'key3': 'content3'}, ['key1', 'key3'], ['part1', 'part2', 'content3']),
])
def test_obtain_data_from_parsed_metadata(dictionary, interesting_fields, expected_output):
    assert entity_extractor.EntityExtractor._obtain_data_from_parsed_metadata(dictionary, interesting_fields) == expected_output


@pytest.mark.parametrize("test_input, expected_output", [
    ([], []),
    ([None], []),
    (['valid text', None], ['valid text']),
    (['valid text', 'more valid text'], ['valid text', 'more valid text'])
])
def test_clean_data(test_input, expected_output):
    assert entity_extractor.EntityExtractor._clean_data(test_input) == expected_output


@pytest.mark.parametrize("test_input, threshold, expected_output", [
    ([], 1, []),
    ([CategorizedEntity(text='good entity', confidence_score=1)], 0.5, [CategorizedEntity(text='good entity', confidence_score=1)]),
    ([CategorizedEntity(text='bad entity', confidence_score=0.3)], 0.5, []),
    ([CategorizedEntity(text='good entity', confidence_score=0.5)], 0.5, [CategorizedEntity(text='good entity', confidence_score=0.5)])
])
def test_remove_entities_below_threshold(test_input, threshold, expected_output):
    assert entity_extractor.EntityExtractor._remove_entities_below_threshold(test_input, threshold) == expected_output


@pytest.mark.parametrize("test_input, expected_output", [
    ([], []),
    ([None], []),
    (['valid text'], ['valid text']),
    (['valid long text'], ['valid long', 'text']),
    (['valid', 'text'], ['valid text']),
    (['valid', 'long text'], ['valid long', 'text']),
    (['valid', 'long', 'text'], ['valid long', 'text']),
    (['valid', 'long', None, 'text'], ['valid long', 'text'])
])
def test_prepare_data_for_ner_client(test_input, expected_output):
    extractor = entity_extractor.EntityExtractor()
    extractor.initialize_client(None, None, max_string_length=10)
    extractor.client_max_string_length = 10
    assert extractor._prepare_data_for_ner_client(test_input) == expected_output


@pytest.mark.parametrize("test_parsed_metadata, test_entities, expected_output", [
    ({}, [], {'EntityA': set(), 'EntityB': set(), 'EntityC': set(), 'EntityD': set()}),
    (
        {'extra_field': 'extra content'},
        [
            CategorizedEntity(text='good entity B', category='EntityB', confidence_score=1),
            CategorizedEntity(text='bad entity A', category='EntityA', confidence_score=0.3),
            CategorizedEntity(text='good entity A', category='EntityA', confidence_score=0.5)
        ],
        {'EntityA': set(['good entity a']), 'EntityB': set(['good entity b', 'extra content']), 'EntityC': set(), 'EntityD': set(['Extra Content'])}
    ),
    (
        {'extra_field': ['content', 'extra content', 'more content']},
        [
            CategorizedEntity(text='good entity D', category='EntityD', confidence_score=1),
            CategorizedEntity(text='entity D', category='EntityD', confidence_score=1),
            CategorizedEntity(text='bad entity C', category='EntityC', confidence_score=0.3),
            CategorizedEntity(text='good entity C', category='EntityC', confidence_score=0.5)
        ],
        {'EntityA': set(), 'EntityB': set(['content', 'extra content', 'more content']), 'EntityC': set(['Good Entity C']), 'EntityD': set(['Good Entity D', 'Extra Content', 'More Content'])}
    )
])
def test_select_interesting_entities(test_parsed_metadata, test_entities, expected_output):
    extractor = entity_extractor.EntityExtractor()
    # Let's use four kinds of entities for the test.
    config_entity_A = entity_extractor.EntityTypeConfig(id='EntityA', threshold=0.5, capitalize_propernouns=False, add_from_metadata=[], remove_substrings=True)
    config_entity_B = entity_extractor.EntityTypeConfig(id='EntityB', threshold=0.7, capitalize_propernouns=False, add_from_metadata=['extra_field'], remove_substrings=False)
    config_entity_C = entity_extractor.EntityTypeConfig(id='EntityC', threshold=0.5, capitalize_propernouns=False, add_from_metadata=[], remove_substrings=False)
    config_entity_D = entity_extractor.EntityTypeConfig(id='EntityD', threshold=0.7, capitalize_propernouns=False, add_from_metadata=['extra_field'], remove_substrings=True)
    config_entity_E = entity_extractor.EntityTypeConfig(id='EntityC', threshold=0.5, capitalize_propernouns=True, add_from_metadata=[], remove_substrings=False)
    config_entity_F = entity_extractor.EntityTypeConfig(id='EntityD', threshold=0.7, capitalize_propernouns=True, add_from_metadata=['extra_field'], remove_substrings=True)
    extractor.initialize_entity_type_configs([config_entity_A, config_entity_B, config_entity_C, config_entity_D, config_entity_E, config_entity_F])
    assert extractor._select_interesting_entities(test_parsed_metadata, test_entities) == expected_output
