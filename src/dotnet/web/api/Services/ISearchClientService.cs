// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using Azure.Search.Documents;
namespace webapi.Services
{
    public interface ISearchClientService
    {
        public SearchClient GetSearchClient();
    }
}