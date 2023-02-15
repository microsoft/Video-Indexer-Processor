"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
# template to use when adding insights without a matching timestamp such as NER extractions
DEFAULT_STRUCTURE = {
    "referenceId": None,
    "referenceUrl": None,
    "confidence": None,
    "description": None,
    "seenDuration": None,
    "id": None,
    "name": "sample",
    "appearances": [
        {
            "startTime": "0:00:00.00",
            "endTime": "0:00:00.00",
            "startSeconds": 0,
            "endSeconds": 0,
        }
    ],
}


# configurable names for parameters to pass to the combine_insights function
VI_INSIGHTS = "vi_insights"
METADATA = "metadata"
NER_INSIGHTS = "ner_insights"

# Video Indexer mutual field names
VI_PEOPLE = "named_people"
VI_LOCATIONS = "named_locations"
VI_ORGS = "named_organizations"


# keys for entities as defined for NER
NER_LOCATION_KEY = "Location"
NER_PERSON_KEY = "Person"
NER_ORG_KEY = "Organizations"


# keys for metadata mutual fields
METADATA_LOCATION_KEY = "video_locations"
METADATA_ORG_KEY = "company_names"
