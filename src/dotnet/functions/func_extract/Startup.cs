// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Diagnostics.CodeAnalysis;
using Common.Options;
using Common.Services;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Waldo.Insights.Extraction;

[assembly: FunctionsStartup(typeof(Waldo.Functions.Extract.Startup))]

namespace Waldo.Functions.Extract
{
    [ExcludeFromCodeCoverage]
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddLogging();
            builder.Services.AddHttpClient();

            builder.Services.AddOptions<VideoIndexerOptions>()
            .Configure<IConfiguration>((settings, configuration) =>
            {
                configuration.GetSection("VideoIndexerOptions").Bind(settings);
            });

            builder.Services.AddOptions<InsightsExtractionOptions>()
            .Configure<IConfiguration>((settings, configuration) =>
            {
                configuration.GetSection("InsightsExtractionOptions").Bind(settings);
            });

            builder.Services.AddSingleton<IAzureResourceClient, AzureResourceClient>();
            builder.Services.AddSingleton<IVideoIndexerClient, VideoIndexerClient>();
            builder.Services.AddSingleton<IBlobServiceClient, AzureBlobServiceClient>();
        }
    }
}