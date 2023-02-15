// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.IdentityModel.Tokens.Jwt;
using Common.Security;
using Common.Services;
using Microsoft.IdentityModel.Tokens;
using Moq;
using webapi.Services;
using Xunit;

namespace api_tests;

public class TokenServicesTest
{
    [Fact]
    public async void Get_Access_Token_Returns_Correct_Token()
    {
        // This has to be done all in one Test because TokenServices can't be reset
        // arrange
        var mockVideoIndexerClient = new Mock<IVideoIndexerClient>();

        // This token is automatically "expired" since it's not a real token
        var expiredToken = "expiredToken";

        mockVideoIndexerClient.Setup(x => x.GetAccessTokenAsync(ArmAccessTokenPermission.Reader, ArmAccessTokenScope.Account, null, null)).ReturnsAsync(expiredToken);

        var tokenServices = new TokenServices(mockVideoIndexerClient.Object);

        // act
        var result = await tokenServices.GetAccessTokenAsync();

        // assert
        Assert.Equal(expiredToken, result);

        // make sure mockVideoIndexerClient was called
        mockVideoIndexerClient.Verify(x => x.GetAccessTokenAsync(It.IsAny<ArmAccessTokenPermission>(), It.IsAny<ArmAccessTokenScope>(), It.IsAny<String>(), It.IsAny<String>()), Times.Once());

        // create token that is not expired
        var descriptor = new SecurityTokenDescriptor()
        {
            Expires = DateTime.UtcNow + TimeSpan.FromDays(100),
        };
        var handler = new JwtSecurityTokenHandler();
        var securityToken = handler.CreateToken(descriptor);
        var token = handler.WriteToken(securityToken);

        // Have the mock return the non expired token now
        mockVideoIndexerClient.Setup(x => x.GetAccessTokenAsync(ArmAccessTokenPermission.Reader, ArmAccessTokenScope.Account, null, null)).ReturnsAsync(token);

        // call getAccessToken a second time, since the first token is expired, the new token should be returned instead
        var result2 = await tokenServices.GetAccessTokenAsync();

        // assert
        Assert.Equal(token, result2);

        // make sure mockVideoIndexerClient was called twice in total now
        mockVideoIndexerClient.Verify(x => x.GetAccessTokenAsync(It.IsAny<ArmAccessTokenPermission>(), It.IsAny<ArmAccessTokenScope>(), It.IsAny<String>(), It.IsAny<String>()), Times.Exactly(2));

        // Have the mock return something else now so the assertion fails in case it gets called (shouldn't get called again since the token is not expired)
        mockVideoIndexerClient.Setup(x => x.GetAccessTokenAsync(ArmAccessTokenPermission.Reader, ArmAccessTokenScope.Account, null, null)).ReturnsAsync("somethingelse");

        // call getAccessToken the third time, since the token saved above was not expired, it should be returned again
        var result3 = await tokenServices.GetAccessTokenAsync();

        // assert
        Assert.Equal(token, result2);

        // make sure mockVideoIndexerClient was still only called twice and not a third time
        mockVideoIndexerClient.Verify(x => x.GetAccessTokenAsync(It.IsAny<ArmAccessTokenPermission>(), It.IsAny<ArmAccessTokenScope>(), It.IsAny<String>(), It.IsAny<String>()), Times.Exactly(2));
    }

}