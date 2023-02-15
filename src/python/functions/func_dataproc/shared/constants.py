"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.

Constants shared by the Functions.
"""
import os

PREFIX = os.environ['LOG_PREFIX']
LOG_PREFIX = f'{PREFIX}[dataproc]'

ORCHESTRATOR_FUNCTION_NAME = 'orchestrator'

MERGE_INSIGHTS_FUNCTION_NAME = 'merge_insights'
WRITE_INSIGHTS_FUNCTION_NAME = 'write_insights'

STORAGE_ENV_VAR = 'DataStorage'

STORAGE_TIER_SILVER = 'silver'
