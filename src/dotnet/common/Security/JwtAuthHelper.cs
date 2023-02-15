// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace Common.Security
{
    public static class JwtHelper
    {

        /// <summary>
        /// Convert a JWT token exp/iss date to UTC DateTime
        /// </summary>
        public static DateTime ConvertFromUnixTimestamp(int timestamp)
        {
            var origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            return origin.AddSeconds(timestamp); //
        }

        /// <summary>
        /// Checks if a token is still valid
        /// </summary>
        public static bool IsTokenExpired(string token)
        {

            var isExpired = true;
            var handler = new JwtSecurityTokenHandler();

            if (!handler.CanReadToken(token))
            {
                return true;
            }

            var jwtSecurityToken = handler.ReadJwtToken(token);
            var expClaim = jwtSecurityToken.Claims.FirstOrDefault(claim => claim.Type == "exp");

            if (expClaim != null && int.TryParse(expClaim.Value, out var expValue))
            {
                var expirationDate = ConvertFromUnixTimestamp(expValue);
                isExpired = DateTime.UtcNow > expirationDate;
            }

            return isExpired;
        }
    }

}