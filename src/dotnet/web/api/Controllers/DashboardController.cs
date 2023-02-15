// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace webapi.Controllers
{
  [Authorize]
  [Route("api/[controller]")]
  [ApiController]
  public class DashboardController : ControllerBase
  {
    private readonly IConfiguration configuration;

    public DashboardController(IConfiguration configuration)
    {
      this.configuration = configuration;
    }

    /// <summary>
    /// Gets the dashboard Url
    /// </summary>
    [HttpGet()]
    [ExcludeFromCodeCoverage]
    public string Get()
    {
      var dashboardUrl = this.configuration["DashboardUrl"];
      return dashboardUrl;
    }
  }
}