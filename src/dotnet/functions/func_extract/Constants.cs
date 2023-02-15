// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
namespace Waldo.Functions.Extract
{
    public static class Constants
    {
        public const string InsightsExtractionTrigger = "InsightsExtractionTrigger";
        public const string InsightsExtractionOrchestrator = "InsightsExtractionOrchestrator";
        public const string CheckVideoIsAvailableActivity = "CheckVideoIsAvailableActivity";
        public const string UploadVideoActivity = "UploadVideoActivity";
        public const string GetVideoIndexStatusActivity = "GetVideoIndexStatusActivity";
        public const string StoreInsightsActivity = "StoreInsightsActivity";
        public const string WriteToDataProcQueueActivity = "WriteToDataProcQueueActivity";
        public const string ServiceBusExtractQueue = "%SERVICEBUS_QUEUE_EXTRACT_NAME%";
        public const string ServiceBusDataProcQueue = "%SERVICEBUS_QUEUE_DATAPROC_NAME%";
        public const string ServiceBus = "ServiceBus";
        public readonly static string LogPrefix = System.Environment.GetEnvironmentVariable("LOG_PREFIX") + "[extract]";
    }
}