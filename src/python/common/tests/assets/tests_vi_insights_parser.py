"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
EXPECTED_INSIGHTS = [
    (
        {
            "description": "this is the description",
            "accountId": "blah-blah",
            "id": "ebfefca035",
            "name": "video1.mp4",
            "userName": "",
            "created": "2022-03-08T17:58:54.2280328+00:00",
            "durationInSeconds": 120,
            "videos": [
                {
                    "insights": {
                        "languageAutoDetectMode": "Multi",
                        "languages": ["en-US"],
                        "transcript": [],
                        "faces": [
                            {"thumbnails": [], "instances": []},
                            {"thumbnails": [], "instance": []},
                        ],
                        "brands": [],
                        "labels": [],
                        "ocr": [],
                    },
                    "thumbnailId": "",
                }
            ],
        },
        {
            "account_id": "blah-blah",
            "videoName": "video1.mp4",
            "videoId": "ebfefca035",
            "duration_in_seconds": 120,
            "description": "",
            "thumbnailId": "",
            "created_at": "022-03-08T17:58:54.2280328+00:00",
            "named_locations": [],
            "brands": [],
            "named_people": [],
            "topics": [],
            "transcript": [],
            "labels": [],
            "ocr": [],
            "faces": [],
            "brands_names": [],
            "topics_names": [],
            "labels_names": [],
            "faces_names": [],
            "named_people_names": [],
            "named_locations_names": [],
        },
    )
]


NO_CONTENT = [
    (
        {
            "description": None,
            "accountId": None,
            "id": None,
            "name": None,
            "userName": None,
            "created": None,
            "durationInSeconds": None,
            "videos": [
                {
                    "insights": {
                        "languageAutoDetectMode": "Multi",
                        "languages": ["en-US"],
                        "transcript": [],
                        "labels": [],
                        "ocr": [],
                    },
                    "thumbnailId": "",
                }
            ],
        },
        {
            "account_id": "",
            "videoName": "",
            "videoId": "",
            "duration_in_seconds": 0,
            "description": "",
            "thumbnailId": "",
            "created_at": "",
            "named_locations": [],
            "brands": [],
            "named_people": [],
            "topics": [],
            "transcript": [],
            "labels": [],
            "ocr": [],
            "faces": [],
            "brands_names": [],
            "topics_names": [],
            "labels_names": [],
            "faces_names": [],
            "named_people_names": [],
            "named_locations_names": [],
        },
    )
]


MULTI_LANGUAGE = [
    (
        {
            "description": None,
            "accountId": None,
            "id": None,
            "name": None,
            "userName": None,
            "created": None,
            "durationInSeconds": None,
            "summarizedInsights": {
                "namedLocations": [],
                "namedPeople": [],
                "topics": [],
            },
            "videos": [
                {
                    "insights": {
                        "languageAutoDetectMode": "Multi",
                        "languages": ["en-US", "fr-FR"],
                        "transcript": ["this is a transcript"],
                        "labels": [],
                        "brands": [],
                        "ocr": [],
                        "faces": [
                            {"thumbnails": [], "instances": []},
                            {"thumbnails": [], "instance": []},
                        ],
                    },
                    "thumbnailId": "",
                }
            ],
        },
        {
            "account_id": "",
            "videoName": "",
            "videoId": "",
            "duration_in_seconds": 0,
            "description": "",
            "thumbnailId": "",
            "created_at": "",
            "named_locations": [],
            "brands": [],
            "named_people": [],
            "topics": [],
            "transcript": [],
            "labels": [],
            "ocr": [],
            "faces": [],
            "brands_names": [],
            "topics_names": [],
            "labels_names": [],
            "faces_names": [],
            "named_people_names": [],
            "named_locations_names": [],
        },
    )
]

INSIGHTS_WITH_SOME_NAMES_TO_EXTRACT = [
    (
        {
            "description": "this is the description",
            "accountId": "blah-blah",
            "id": "ebfefca035",
            "name": "video1.mp4",
            "userName": "",
            "created": "2022-03-08T17:58:54.2280328+00:00",
            "durationInSeconds": 120,
            "videos": [
                {
                    "insights": {
                        "languageAutoDetectMode": "Multi",
                        "languages": ["en-US"],
                        "transcript": [],
                        "faces": [
                            {"thumbnails": [], "instances": [], "name": "someone"},
                            {"thumbnails": [], "instance": [], "name": "someone else"},
                        ],
                        "brands": [{"name": "super brand"}, {"name": "another brand"}],
                        "labels": [{"name": "important label"}],
                        "ocr": [],
                    },
                    "thumbnailId": "",
                }
            ],
        },
        {
            "account_id": "blah-blah",
            "videoName": "video1.mp4",
            "videoId": "ebfefca035",
            "duration_in_seconds": 120,
            "description": "",
            "thumbnailId": "",
            "created_at": "022-03-08T17:58:54.2280328+00:00",
            "named_locations": [],
            "brands": [{"name": "super brand"}, {"name": "another brand"}],
            "named_people": [],
            "topics": [],
            "transcript": [],
            "labels": [{"name": "important label"}],
            "ocr": [],
            "faces": [{"name": "someone"}, {"name": "someone else"}],
            "brands_names": ["super brand", "another brand"],
            "topics_names": [],
            "labels_names": ["important label"],
            "faces_names": ["someone", "someone else"],
            "named_people_names": [],
            "named_locations_names": [],
        },
    )
]

INSIGHTS_WITH_ALL_NAMES_TO_EXTRACT = [
    (
        {
            "description": "this is the description",
            "accountId": "blah-blah",
            "id": "ebfefca035",
            "name": "video1.mp4",
            "userName": "",
            "created": "2022-03-08T17:58:54.2280328+00:00",
            "durationInSeconds": 120,
            "videos": [
                {
                    "insights": {
                        "languageAutoDetectMode": "Multi",
                        "languages": ["en-US"],
                        "transcript": [],
                        "faces": [
                            {"thumbnails": [], "instances": [], "name": "someone"},
                            {"thumbnails": [], "instance": [], "name": "someone else"},
                        ],
                        "brands": [{"name": "super brand"}, {"name": "another brand"}],
                        "labels": [{"name": "important label"}],
                        "ocr": [],
                    },
                    "thumbnailId": "",
                }
            ],
        },
        {
            "account_id": "blah-blah",
            "videoName": "video1.mp4",
            "videoId": "ebfefca035",
            "duration_in_seconds": 120,
            "description": "",
            "thumbnailId": "",
            "created_at": "022-03-08T17:58:54.2280328+00:00",
            "named_locations": [{"name": "Planet Earth"}, {"name": "Milky Way"}],
            "brands": [{"name": "super brand"}, {"name": "another brand"}],
            "named_people": [{"name": "John Doe"}],
            "topics": [{"name": "breaking news"}],
            "transcript": [],
            "labels": [{"name": "important label"}],
            "ocr": [],
            "faces": [{"name": "someone"}, {"name": "someone else"}],
            "brands_names": ["super brand", "another brand"],
            "topics_names": ["breaking news"],
            "labels_names": ["important label"],
            "faces_names": ["someone", "someone else"],
            "named_people_names": ["John Doe"],
            "named_locations_names": ["Planet Earth", "Milky Way"],
        },
    )
]
SPLIT_SCENES = {
    "description": "this is the description",
    "accountId": "blah-blah",
    "id": "ebfefca035",
    "name": "video1.mp4",
    "userName": "",
                "created": "2022-03-08T17:58:54.2280328+00:00",
                "durationInSeconds": 120,
                "videos": [
                    {
                        "insights": {
                            "languageAutoDetectMode": "Multi",
                            "languages": ["en-US"],
                            "transcript": [],
                            "faces": [
                                {"thumbnails": [], "instances": [], "name": "someone"},
                                {"thumbnails": [], "instance": [], "name": "someone else"},
                            ],
                            "brands": [{"name": "super brand"}, {"name": "another brand"}],
                            "labels": [{"name": "important label"}],
                            "ocr": [],
                            "scenes":[{
                                "id": 1,
                                "instances": [
                                    {
                                        "start": "0:00:00",
                                        "end": "0:02:00.0000"
                                    }
                                ]
                            }, ],
                            "shots": [{
                                "id": 1,
                                "instances": [
                                    {
                                        "start": "0:00:00",
                                        "end": "0:01:10.0000"
                                    }]},
                                {
                                "id": 2,
                                    "instances": [
                                        {
                                            "start": "0:01:10",
                                            "end": "0:02:00.0000"
                                        }
                                    ]},
                            ]
                        },
                        "thumbnailId": "",
                    }
                ],
}


INFO_PIECE = {
    "id": 3,
    "name": "information",
            "language": "en-US",
            "instances": [
                {
                    "confidence": 0.9546,
                    "start": "0:00:05.000",
                    "end": "0:00:10.000"
                }
            ]
}
