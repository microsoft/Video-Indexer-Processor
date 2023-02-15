// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Threading.Tasks;
using Azure.Core;
using Azure.Identity;

namespace Common.Services
{
    public class AzureResourceClient : IAzureResourceClient
    {
        private const string AzureResourceManager = "https://management.azure.com";

        public async Task<string> GetArmAccessTokenAsync()
        {
            var tokenRequestContext = new TokenRequestContext(new[] { $"{AzureResourceManager}/.default" });
            var tokenRequestResult = await new DefaultAzureCredential().GetTokenAsync(tokenRequestContext).ConfigureAwait(false);

            return tokenRequestResult.Token;
        }
    }
}



