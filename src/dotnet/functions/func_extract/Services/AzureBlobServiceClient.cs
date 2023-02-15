// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Diagnostics.CodeAnalysis;
using Azure.Core;
using Azure.Storage.Blobs;

namespace Common.Services
{
    [ExcludeFromCodeCoverage]
    public class AzureBlobServiceClient : IBlobServiceClient
    {
        public BlobClient GetBlobClient(Uri uri)
        {
            return new BlobClient(uri);
        }

        public BlobClient GetBlobClient(Uri uri, TokenCredential credential)
        {
            return new BlobClient(uri, credential);
        }

        public BlobServiceClient GetBlobServiceClient(Uri uri, TokenCredential credential)
        {
            return new BlobServiceClient(uri, credential);
        }
    }
}