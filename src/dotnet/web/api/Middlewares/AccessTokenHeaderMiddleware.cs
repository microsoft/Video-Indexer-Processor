// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Globalization;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;

namespace webapi.Middlewares
{

    /// <summary>
    /// Middleware to handle all requests containing an accessToken arg in the query string
    /// </summary>
    public class AccessTokenHeaderMiddleware
    {
        private readonly RequestDelegate next;

        public AccessTokenHeaderMiddleware(RequestDelegate next)
        {
            this.next = next;
        }

        /// <summary>
        /// Set a bearer token from an access token stored in query string
        /// It's mainly used by the subtitles, since we can't intercept the call from the video html tag (to inject the access token in the header)
        /// </summary>
        public async Task InvokeAsync(HttpContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }
            if (context.Request.QueryString.HasValue && string.IsNullOrWhiteSpace(context.Request.Headers["Authorization"]))
            {
                var queryString = HttpUtility.ParseQueryString(context.Request.QueryString.Value);
                string token = queryString.Get("accessToken");

                if (!string.IsNullOrWhiteSpace(token))
                    context.Request.Headers.Add("Authorization", new[] { string.Format(CultureInfo.InvariantCulture, "Bearer {0}", token) });
            }

            await this.next(context);
        }
    }

    public static class RequestCultureMiddlewareExtensions
    {
        public static IApplicationBuilder UseAccessTokenHeader(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AccessTokenHeaderMiddleware>();
        }
    }
}