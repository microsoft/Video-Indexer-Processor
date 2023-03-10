# Project codename WALDO : Improve video search using AI

This repository contains code and documentation of WALDO (**W**eb **A**pplication to **L**ookup **D**igital **O**bjects) which is a solution developed by Microsoft. It aims to improve video search using Artificial Intelligence. It does the following :

- Automates the analysis of videos with Azure Video Indexer,
- Creates and improves the search index with Video Indexer insights and optional metadata
- Provides a web UI application to search and see results
- Logs the behavior and feedback of users (in order for the admin or data science team to improve the search index)
- Provides a dashboard which displays statistics on platform usage and search performances

[Overview](docs-internal/img/overview-slide.png)

## Documentation

Technical documentation :

- [Getting started with Terraform](/docs/1-terraform.md)
- [Main orchestrator](/docs-internal/dotnet/orchestrator.md)
- [Data orchestrator](/docs-internal/python/orchestrator.md)
- [function-apps](/docs/2-function-apps.md)
- [index-creation](/docs/3-index-resources.md)
- [web-application](/docs/4-web-application.md)
- [Testing](/docs-internal/dotnet/testing.md)

## Notes

## Limited Access features of Azure Video Indexer

Microsoft facial recognition services are Limited Access in order to help prevent the misuse of the services in accordance with our [AI Principles](https://www.microsoft.com/ai/responsible-ai?SilentAuth=1&wa=wsignin1.0&activetab=pivot1%3aprimaryr6) and [facial recognition](https://blogs.microsoft.com/on-the-issues/2018/12/17/six-principles-to-guide-microsofts-facial-recognition-work/) principles. The Face Identify and Celebrity Recognition operations in Azure Video Indexer are Limited Access features that require registration.  

Please go to [this page](https://docs.microsoft.com/en-us/azure/azure-video-indexer/limited-access-features) to get more information on how to enable limited access feature in Video Indexer.

## Contacts

 **Company** | **Role** | **Contact** |
|-|-|-|
|Microsoft| Technical Program Manager | [Xavier Pouyat](mailto:xpouyat@microsoft.com)|
|Microsoft| Development Lead | [Yannick Brombach](mailto:yabromba@microsoft.com) |
|Microsoft| Data Science Lead | [Malvina Matlis](mailto:melmatlis@microsoft.com) |

## Infos

Trademarks This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft’s Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.

- [Microsoft Code Of Conduct](https://opensource.microsoft.com/codeofconduct/)
- [Reporting security issues](https://docs.opensource.microsoft.com/releasing/securing-content/reporting-security-issues/)
