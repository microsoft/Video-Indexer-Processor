// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
namespace Waldo.Insights.Extraction
{
    public class InsightsExtractionOptions
    {
        public Uri DataStorageUri { get; set; }
        public string BronzeContainerName { get; set; }
        public string SilverContainerName { get; set; }
    }
}