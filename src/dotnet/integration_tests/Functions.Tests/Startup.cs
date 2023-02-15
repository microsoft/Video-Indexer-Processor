// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
namespace Functions.Tests;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

public class Startup
{
    public void ConfigureHost(IHostBuilder hostBuilder)
    {
        var config = new ConfigurationBuilder()
            .AddEnvironmentVariables()
            .Build();

        hostBuilder.ConfigureHostConfiguration(builder => builder.AddConfiguration(config));
    }
}
