"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import json
import os
import unittest
from unittest.mock import patch

with patch.dict(os.environ, {'LOG_PREFIX': 'prefix'}):
    from orchestrator import orchestrator

from shared.constants import (MERGE_INSIGHTS_FUNCTION_NAME,
                              WRITE_INSIGHTS_FUNCTION_NAME)


class TestOrchestrator(unittest.TestCase):

    @patch('azure.durable_functions.DurableOrchestrationContext')
    def test_orchestrator(self, context):
        message = {'video_id': '1234'}
        context.get_input.return_value = json.dumps(message)
        context.call_activity_with_retry.side_effect = ['result1', 'result2']
        _ = list(orchestrator(context))
        assert context.call_activity_with_retry.call_count == 2
        assert context.call_activity_with_retry.call_args_list[0][0][0] == MERGE_INSIGHTS_FUNCTION_NAME
        assert context.call_activity_with_retry.call_args_list[1][0][0] == WRITE_INSIGHTS_FUNCTION_NAME

    @patch('azure.durable_functions.DurableOrchestrationContext')
    def test_orchestrator_exception(self, context):
        context.call_activity_with_retry.side_effect = Exception()
        with self.assertRaises(Exception):
            _ = list(orchestrator(context))
