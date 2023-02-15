// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Collections.Generic;
using System.IO;
using Common.Options;
using Common.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using webapi.Options;
using webapi.Middlewares;
using webapi.Services;

namespace webapi
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddLogging();


      services.AddMicrosoftIdentityWebApiAuthentication(Configuration);

      // If we need to call the graph, add this portion
      // .EnableTokenAcquisitionToCallDownstreamApi()
      //     .AddMicrosoftGraph(Configuration.GetSection("DownstreamApi"))
      //     .AddInMemoryTokenCaches();


      // Disabling validation of issuer and audience (just for debug purpose)
      // Override Token Validation Parameters
      // services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
      //     .Configure(options =>
      //     {
      //         options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
      //         {
      //             ValidateIssuer = false,
      //             ValidateAudience = false,
      //         };
      //     });


      services.Configure<SearchConfigurationOptions>(options => Configuration.Bind("Search", options));
      services.Configure<VideoIndexerOptions>(options => Configuration.Bind("VideoIndexer", options));
      services.AddHttpClient();
      services.AddSingleton<ITokenServices, TokenServices>();
      services.AddSingleton<IAzureResourceClient, AzureResourceClient>();
      services.AddSingleton<IVideoIndexerClient, VideoIndexerClient>();
      services.AddSingleton<ISearchClientService, SearchClientService>();

      services.AddControllers()
    // Adding this option to be able to send back JObjet from any Web Api
    .AddNewtonsoftJson(options =>
    {
      options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
      options.SerializerSettings.Formatting = Formatting.None;
      options.SerializerSettings.Converters.Add(new StringEnumConverter());
    });
      services.AddEndpointsApiExplorer();

      services.AddSwaggerGen(c =>
      {
        var azureAdSection = Configuration.GetSection("AzureAd");
        var instance = azureAdSection["Instance"];
        instance = instance.StartsWith("https://", StringComparison.InvariantCultureIgnoreCase) ? instance : $"https://{instance}";
        instance = instance.EndsWith("/", StringComparison.InvariantCultureIgnoreCase) ? instance.TrimEnd('/') : instance;
        var tenantId = azureAdSection["TenantId"];

        var swaggerSection = Configuration.GetSection("Swagger");
        var scopes = swaggerSection["Scopes"];

        var authorizationUrl = new Uri($"{instance}/{tenantId}/oauth2/v2.0/authorize");
        var tokenUrl = new Uri($"{instance}/{tenantId}/oauth2/v2.0/token");

        c.SwaggerDoc("v1", new OpenApiInfo { Title = "webapi", Version = "v1" });

        var oauth2Scheme = new OpenApiSecurityScheme
        {
          Type = SecuritySchemeType.OAuth2,
          Flows = new OpenApiOAuthFlows
          {
            AuthorizationCode = new OpenApiOAuthFlow
            {
              AuthorizationUrl = authorizationUrl,
              TokenUrl = tokenUrl,
              Scopes = new Dictionary<string, string>
                      {
                                { scopes , scopes }
                      },
            }
          },
          Description = "OpenId Security Scheme"
        };

        // This filter add a new line in swagger to indicates the type of response we get if we are not authorized
        c.AddSecurityDefinition("oauth2", oauth2Scheme);

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
          {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
                        },
                        Array.Empty<string>()
                    }
          });
      });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
        app.UseDeveloperExceptionPage();

      app.UseAccessTokenHeader();

      app.UseSwagger();
      app.UseSwaggerUI(c =>
      {
        var swaggerSection = Configuration.GetSection("Swagger");
        var clientId = swaggerSection["ClientId"];

        c.SwaggerEndpoint("/swagger/v1/swagger.json", "webapi v1");
        c.OAuthClientId(clientId);
        c.OAuthAppName("API");
        c.OAuthScopeSeparator(" ");
        c.OAuthUsePkce();

      });

      app.UseHttpsRedirection();

      app.UseRouting();
      app.UseAuthentication();
      app.UseAuthorization();

      app.UseStaticFiles(new StaticFileOptions
      {
        FileProvider = new PhysicalFileProvider(
              Path.Combine(env.ContentRootPath, "Images")),
        RequestPath = "/Images"
      });

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapControllers();
      });
    }
  }


}
