// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Threading.Tasks;
using Common.Security;
using Common.Services;

namespace webapi.Services
{



  /// <summary>
  /// TokenServices allows web api to cache an access token
  /// </summary>
  public class TokenServices : ITokenServices
  {
    private static string currentToken;

    public TokenServices(IVideoIndexerClient videoIndexerClient)
    {
      VideoIndexerClient = videoIndexerClient;
    }


    public IVideoIndexerClient VideoIndexerClient { get; }

    /// <summary>
    /// Gets a an access token, from Azure AD or from the local cache
    /// </summary>
    /// <returns> A JWT Access Token</returns>
    public async Task<string> GetAccessTokenAsync()
    {
      bool isTokenExpired = true;
      if (currentToken != null)
        isTokenExpired = JwtHelper.IsTokenExpired(currentToken);

      if (isTokenExpired || string.IsNullOrEmpty(currentToken))
        currentToken = await this.VideoIndexerClient.GetAccessTokenAsync(ArmAccessTokenPermission.Reader, ArmAccessTokenScope.Account);

      return currentToken;
    }

  }
}