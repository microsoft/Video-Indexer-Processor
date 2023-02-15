"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

with patch.dict(os.environ, {'LOG_PREFIX': 'prefix'}):
    from queue_trigger import main


@pytest.mark.asyncio
async def test_queue_trigger():
    with patch('azure.durable_functions.DurableOrchestrationClient') as mock_client:
        mock_client_instance = AsyncMock()
        mock_client.return_value = mock_client_instance
        message = MagicMock()
        starter = "fake_starter"
        await main(message, starter)
        mock_client.assert_called_once()
        mock_client_instance.start_new.assert_called_once()
