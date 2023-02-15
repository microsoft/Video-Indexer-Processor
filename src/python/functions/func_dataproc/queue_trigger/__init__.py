"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import logging

import azure.functions as func
import azure.durable_functions as df

from shared.constants import LOG_PREFIX, ORCHESTRATOR_FUNCTION_NAME


async def main(message: func.ServiceBusMessage, starter: str):
    try:
        payload = message.get_body().decode('utf-8')
        client = df.DurableOrchestrationClient(starter)
        instance_id = await client.start_new(ORCHESTRATOR_FUNCTION_NAME, client_input=payload)
        logging.info(f"{LOG_PREFIX} started orchestrator id {instance_id}")
    except Exception:
        logging.exception(f"{LOG_PREFIX} orchestrator start failed")
        raise
