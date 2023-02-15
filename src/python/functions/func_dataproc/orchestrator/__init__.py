"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import logging
import azure.durable_functions as df
from shared.constants import LOG_PREFIX, MERGE_INSIGHTS_FUNCTION_NAME, WRITE_INSIGHTS_FUNCTION_NAME


def orchestrator(context: df.DurableOrchestrationContext):
    '''This is the dataprocessing orchestrator which is triggered by the queue_trigger.
    As input in the OrchestrationContext it expects a json string which at least contains an attribute called video_id.
    It first calls merge_insights with the given input, and uses the result as an input for a write_insights call.
    Automatically retries both activities every 5 seconds, maximum 3 times.
    Throws an exception if one of the sub-activities still fails after 3 retries.'''
    message = context.get_input()
    message_dict = json.loads(message)
    video_id = message_dict['video_id']
    first_retry_interval_in_milliseconds = 5000
    max_number_of_attempts = 3

    retry_options = df.RetryOptions(first_retry_interval_in_milliseconds, max_number_of_attempts)

    try:
        merge_result = yield context.call_activity_with_retry(MERGE_INSIGHTS_FUNCTION_NAME, retry_options, message)
        logging.info(f"{LOG_PREFIX} Merged insights for input {video_id}")
        _ = yield context.call_activity_with_retry(WRITE_INSIGHTS_FUNCTION_NAME, retry_options, merge_result)
        logging.info(f"{LOG_PREFIX} Wrote insights to Cosmos DB for video {video_id}")
    except Exception:
        logging.exception(f"{LOG_PREFIX} Dataproc orchestrator failed because a sub-activity produced an error")
        raise


main = df.Orchestrator.create(orchestrator)
