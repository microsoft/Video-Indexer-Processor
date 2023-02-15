"""
Copyright (c) Microsoft Corporation.
Licensed under the MIT license.
"""
import os
from unittest.mock import MagicMock, patch

with patch.dict(os.environ, {'LOG_PREFIX': 'prefix'}):
    from write_insights import main


def test_write_insights():
    context = MagicMock()
    doc = MagicMock()
    main(context, doc)
    doc.set.assert_called_once()
