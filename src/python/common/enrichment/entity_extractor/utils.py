"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
from typing import Set
import json
import re
import os


def remove_substring_elements(elements: Set[str]) -> Set[str]:
    """Remove those items from the set passed as parameter that are substrings of another item in the set.

    Args:
        elements (Set[str]): original set of strings.

    Returns:
        Set[str]: set of strings with no item that is a substring of another item.
    """
    sorted_elements = sorted(elements, key=lambda elem: (len(elem), elem))
    return set(
        [
            j
            for i, j in enumerate(sorted_elements)
            if all(j not in k for k in sorted_elements[i + 1:])
        ]
    )


def perform_capitalize_propernouns(elements: Set[str]) -> Set[str]:
    """Capitalize the proper nouns (NEs).

    Args:
       elements (Set[str]): original set of strings.

    Returns:
        Set[str]: set of strings with capitalized entities
        Conventions:
        - Exception words are not capitalized (in the original version: prepositions and articles)
        - Acronyms (based on Library on Congress' list of acronyms) are capitalized according to the rules
        (https://www.loc.gov/static/collections/foreign-affairs-oral-history/documents/acronyms.pdf)
        Ex:
        - One word: paris -> Paris
        - Multiple words: united nations --> United Nations
        - Acronym: nato --> NATO (acronyms from LibCongress are capitalized according to the provided rules)
        - Complex: ministry of defense --> Ministry of Defense
    """

    with open(
        f"{os.path.dirname(__file__)}/assets/acromyns_lib_congress.json"
    ) as acronyms_file:
        acronyms = json.load(acronyms_file)

    with open(
        f"{os.path.dirname(__file__)}/assets/caps_exeptions.json"
    ) as caps_exeptions:
        preps_articles = json.load(caps_exeptions)

    def _word_callback(match):
        """This is a callback function for the regular expression
        in charge of doing the capitalization of a word.
        """
        word = match.group(0)

        if word.isupper() or word in preps_articles:
            return word
        if word in acronyms.keys():
            return acronyms[word]
        else:
            return word.capitalize()

    def capwords(data):
        """This function converts a NER into a capitalized version of itself."""
        return re.sub(r"[\w'\-\_]+", _word_callback, data)

    return set([capwords(i) for i in elements])
