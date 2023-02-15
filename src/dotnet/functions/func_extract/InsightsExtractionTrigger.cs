// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Extensions.Logging;
using static Waldo.Functions.Extract.Constants;

namespace Waldo.Insights.Extraction
{
    public partial class InsightsExtraction
    {
        /// <summary>
        /// Triggered when a new message arrives in the service bus extract queue. Starts InsightsExtractionOrchestrator asynchronously.
        /// </summary>
        /// <param name="message">The message taken from the extract queue</param>
        /// <param name="starter">Durable client with which the orchestration is started</param>
        /// <param name="logger">Logger</param>
        /// <returns>An empty Task object which completes when the orchestration has been started</returns>
        [FunctionName(InsightsExtractionTrigger)]
        public static async Task Run([ServiceBusTrigger(ServiceBusExtractQueue, Connection = ServiceBus)] object message, [DurableClient] IDurableOrchestrationClient starter, ILogger logger)
        {
            string instanceId = await starter.StartNewAsync(InsightsExtractionOrchestrator, message);
            logger.LogInformation("{prefix} Started orchestration with ID = '{instanceId}'.", LogPrefix, instanceId);

            return;
        }
    }
}