"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import pytest
from enrichment.metadata_parser.multilanguage_transformer import MultilanguageTransformation


@pytest.mark.parametrize("mock_content,mock_language_set, expected", [("natural with englsih and urdu speech ", ["english", "urdu", 'ukrainian', 'russian', 'french'], ["english", "urdu"]),
                                                                      ("live report-part mute", [
                                                                          "english", "urdu", 'ukrainian', 'russian', 'french'], []),
                                                                      ("ukrainian-russian-narration-part mute", [
                                                                          "english", "urdu", 'ukrainian', 'russian', 'french'], ["ukrainian", "russian"]),
                                                                      ("english,french", ["english", "urdu", 'ukrainian', 'russian', 'french'], [
                                                                          "english", "french"]),
                                                                      ("spanish&", ["english", "urdu", 'ukrainian',
                                                                                    'russian', 'french', 'spanish'], ["spanish"]),
                                                                      ("speechh", ["english", "urdu", 'ukrainian',
                                                                                   'russian', 'french', 'spanish'], []),
                                                                      ("ENGLISH WITH FRENCH", ["english", "urdu", 'ukrainian',
                                                                                               'russian', 'french', 'spanish'], ["english", "french"])
                                                                      ])
def test_clean_video_language(mock_content, mock_language_set, expected):
    """The test checks if identical vectors return the same distribution result
    """

    parser = MultilanguageTransformation()
    parser.language_set = mock_language_set
    parsed = parser.clean_video_language(mock_content)
    assert set(parsed) == set(expected)


@pytest.mark.parametrize("mock_dictionary, mock_video_language, expected", [({"english": "en"}, [], 'auto'),
                                                                            ({"english": "en"}, [
                                                                                "english"], 'en'),
                                                                            ({"english": "en"}, [
                                                                                "bfbsd"], 'auto'),
                                                                            ({"english": "en"}, [
                                                                                "spanish"], 'auto'),
                                                                            ({"english": "en"}, [
                                                                                "french", "spanish"], 'multi'),
                                                                            ({"tetum": "tet"}, [
                                                                                "tetum"], 'tet'),
                                                                            ({"english": "en"}, [
                                                                                "ENGLISH"], 'en')

                                                                            ])
def test_multi_language_code_categorization(mock_dictionary, mock_video_language, expected):
    """The test checks if identical vectors return the same distribution result
    """

    parser = MultilanguageTransformation()
    parser.language_dict = mock_dictionary
    parsed = parser.categorizing_multi_language_code(mock_video_language)
    assert parsed == expected


@pytest.mark.parametrize("mock_string, expected", [("THIS IS A STRING", 'auto'),
                                                   ("ENGLISH AND SOME ukrainian",
                                                    'multi'),
                                                   ("ARABIC WITH NAT",
                                                    "ar-QA"),
                                                   ("ENGLISH WITH NAT",
                                                    'en-US'),
                                                   ("French WITH PART MUTE",
                                                    'fr-FR'),
                                                   ("",
                                                    'auto')
                                                   ])
def test_language_string_to_language_code(mock_string, expected):
    """The test checks if identical vectors return the same distribution result
    """

    parser = MultilanguageTransformation()

    parsed = parser.language_string_to_language_code(mock_string)
    assert parsed == expected
