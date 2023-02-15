// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Logging;

namespace Waldo.Insights.Extraction
{
    public partial class InsightsExtraction
    {
        public Uri GetVideoWithSasUri(Uri videoUri, ILogger logger)
        {
            if (videoUri == null)
            {
                throw new ArgumentNullException(nameof(videoUri));
            }
            var storageUri = videoUri.Scheme + "://" + videoUri.Host;

            try
            {
                var blobClient = this.blobServiceClient.GetBlobClient(videoUri);
                var blobServiceClient = this.blobServiceClient.GetBlobServiceClient(new Uri(storageUri), new DefaultAzureCredential());

                // Get a user delegation key for the Blob service that's valid for 2 hours
                var userDelegationKey = blobServiceClient.GetUserDelegationKey(
                    DateTimeOffset.UtcNow,
                    DateTimeOffset.UtcNow.AddHours(2));

                var sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = blobClient.BlobContainerName,
                    BlobName = blobClient.Name,
                    Resource = "b", // b for blob, c for container
                    StartsOn = DateTimeOffset.UtcNow,
                    ExpiresOn = DateTimeOffset.UtcNow.AddHours(2),
                };

                sasBuilder.SetPermissions(BlobSasPermissions.Read);

                // Add the SAS token to the container URI
                var blobUriBuilder = new BlobUriBuilder(blobClient.Uri)
                {
                    Sas = sasBuilder.ToSasQueryParameters(userDelegationKey, blobClient.AccountName)
                };

                var sasUri = blobUriBuilder.ToUri();

                return sasUri;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "{prefix} failed to generate SAS URI for {videoUri}", Functions.Extract.Constants.LogPrefix, videoUri.ToString());
                throw;
            }
        }
    }
}