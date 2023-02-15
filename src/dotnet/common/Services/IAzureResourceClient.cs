// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Threading.Tasks;

namespace Common.Services
{
    public interface IAzureResourceClient
    {
        Task<string> GetArmAccessTokenAsync();
    }
}