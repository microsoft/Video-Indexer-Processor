// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Azure.Extensions.AspNetCore.Configuration.Secrets;


namespace webapi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    if (context.HostingEnvironment.IsProduction())
                    {
                        var builtConfig = config.Build();
                        var keyvaultName = builtConfig["KeyVaultName"];

                        var secretClient = new SecretClient(
                            new Uri($"https://{keyvaultName}.vault.azure.net/"),
                            new DefaultAzureCredential());

                        config.AddAzureKeyVault(secretClient, new KeyVaultSecretManager());
                    }
                })
                .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>());

    }
}
