// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Threading.Tasks;

namespace webapi.Services
{


    public interface ITokenServices
    {
        Task<string> GetAccessTokenAsync();
    }
}