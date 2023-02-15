"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import re
from logging import log
import os

log_text = os.getenv("LOG_PREFIX")


class ViInsightsParser:
    def load_vi_insights(self, filepath):
        """
        This method takes the filepath of the Video Indexer insights json and loads the data as raw_insights
        """
        with open(filepath, "r") as f:
            raw_insights = json.load(f)
        return raw_insights

    @staticmethod
    def _check_if_multi_language(video_insights: dict) -> bool:
        """
            Check if video insights contain a video with multiple languages
        Args:
            video_insights (dict): Video Indexer raw insights

        Returns:
            bool: True if video is multi lingual
        """
        return any(
            [
                video_insights.get("languageAutoDetectMode", "").lower() == "multi",
                len(video_insights.get("languages", [])) > 1,
            ]
        )

    @staticmethod
    def is_multilanguage_video(video_insights):
        """
        This method checks if there are multiple languages present in the video
        """
        if ViInsightsParser._check_if_multi_language(video_insights):
            return True

    @staticmethod
    def extract_faces_insights(video_insights):
        """
        This method removes the thumbnails and the instances from the face insights
        """
        face_insights = video_insights["faces"]
        for face in face_insights:
            if "thumbnails" in face:
                del face["thumbnails"]
            if "instances" in face:
                del face["instances"]

        return face_insights

    def check_video_insights_value(self, insights, key):
        """
        This methods checks if the key we are looking for exists or returns an empty list.
        If the language of the video is multi then we will replace the transcript
        with an empty list.
        """
        video_insights = insights["videos"][0]["insights"]
        if key not in video_insights:
            return list()
        elif key == "transcript" and self.is_multilanguage_video(video_insights):
            return list()
        elif key == "faces":
            return self.extract_faces_insights(video_insights)
        else:
            return video_insights[key]

    @staticmethod
    def _extract_names_for_semantic_search(insights: dict, field: str) -> dict:
        """Extract names from a collection of data structures (insights[field]) and create a new
            field only with those names (insights[field + "_names"]).

        Args:
            insights (dict): Dictionary where to find the collection of complex structures.
            field (str): Id in the dictionary where the collection of complex structures is (insights[field]).

        Returns:
            dict: Original dictionary with one extra entry (insights[field + "_names"]) with the collection
                of names extracted from the collection of complex structures.
        """
        names = []
        for elem in insights.get(field, []):
            name = elem.get("name", None)
            if name is not None:
                names.append(name)
        # This assumes that insights[field + "_names"] did not exist before,
        # which is reasonable given how the insights are reshaped in this class.
        insights[f"{field}_names"] = names
        return insights

    def parse_vi_insights(self, raw_insights):
        """
        This method takes the raw_insights that we have loaded then we check whether each key is
        present (in some cases if not we check if they appear elsewhere we take
        the values from there). It then creates a new dictionary with only the info we want ready
        to be saved to a new json
        """
        avam_insights = {}
        list_of_video_insights = [
            "brands",
            "topics",
            "labels",
            "transcript",
            "faces",
            "ocr",
        ]

        avam_insights["account_id"] = raw_insights.get("accountId", "")
        avam_insights["videoName"] = raw_insights.get("name", "")
        avam_insights["videoId"] = raw_insights.get("id", "")
        avam_insights["duration_in_seconds"] = raw_insights.get("durationInSeconds", "")
        avam_insights["created_at"] = raw_insights.get("created", "")
        avam_insights["description"] = raw_insights.get("description", "")
        avam_insights["thumbnailId"] = raw_insights["videos"][0].get("thumbnailId", "")
        avam_insights["named_people"] = self.check_video_insights_value(
            raw_insights, "namedPeople"
        )
        avam_insights["named_locations"] = self.check_video_insights_value(
            raw_insights, "namedLocations"
        )

        for each in list_of_video_insights:
            avam_insights[each] = self.check_video_insights_value(raw_insights, each)

        # Extract the string names of each field to enable semantic search.
        fields_to_extract_names = [
            "brands",
            "topics",
            "labels",
            "faces",
            "named_people",
            "named_locations",
        ]
        for field in fields_to_extract_names:
            avam_insights = ViInsightsParser._extract_names_for_semantic_search(
                avam_insights, field
            )

        return avam_insights

    def save_vi_insights_json(self, avam_insights):
        """
        This methods packages the dictionary we create with the data we want and saves it to
        a new json
        """
        file_name = re.sub(r".mp4", "", avam_insights["name"])
        json_object = json.dumps(avam_insights)

        new_filename = file_name + ".json"

        with open(new_filename, "w") as outfile:
            outfile.write(json_object)

        log.info(f"{log_text} {new_filename} with insights saved")
