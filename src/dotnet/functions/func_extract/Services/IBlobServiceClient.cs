// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using Azure.Core;
using Azure.Storage.Blobs;

namespace Common.Services
{
    public interface IBlobServiceClient
    {
        BlobClient GetBlobClient(Uri uri);
        BlobClient GetBlobClient(Uri uri, TokenCredential credential);
        BlobServiceClient GetBlobServiceClient(Uri uri, TokenCredential credential);
    }
}