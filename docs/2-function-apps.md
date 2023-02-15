# Deploy the Function Apps

Once the infrastructure has been deployed, you will need to deploy three Function Apps that implement the platform's data pipelines. Two of these are written in Python:

- `func_trigger`
- `func_dataproc`

And one is written in .NET/C#:

- `func_extract`

Although written in different languages, the steps to deploy them are similar, using the Azure command line tools.

## Pre-requisites

You will need the following installed on your local machine:

- Docker, i.e. the `docker` command. This will be used to build the Python apps locally. In most cases, you will use [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- Azure CLI, i.e. the `az` command. See [How to install the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
- Azure Functions Core Tools, i.e. the `func` command. See [Install the Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Cmacos%2Ccsharp%2Cportal%2Cbash#install-the-azure-functions-core-tools)
- The .NET SDK, i.e. the `dotnet` command. See [Install .NET on Windows, Linux, and macOS](https://learn.microsoft.com/en-us/dotnet/core/install/).

You will run the commands below from a Unix-like shell terminal session, using a variant of `sh` or `bash`.

Before running the deployment commands, make sure you are logged in to your Azure subscription using `az login`. You can check which subscription you are connected to with `az account show`.

## Deploy the Python apps

Change to the target app directory:

```sh
cd src/python/functions/func_trigger
```

We must first install all the Python requirements for the app. Since the app is executed on a Linux host, we need to execute this step in a Docker container running Linux, so that we get the Linux versions of any binary dependencies. We will use the standard Python image for this. Launch the container locally using this command:

```sh
docker run --platform linux/amd64 --rm -it -v $(pwd)/../..:/app amd64/python:3.8 bash
```

This command will place you in a shell running in Docker container, where you can run the following steps. The `-v` option is used to mount the source code directory from your machine to the container.

Once in the container, change to the source code directory:

```sh
cd /app/functions/func_trigger
```

Install the required Python dependencies for the function app. This will not install anything in the system Python environment, it will install the dependencies in a sub-directory specific to the function app, using the `--target` option of `pip install`.

```sh
pip install --target=".python_packages/lib/site-packages" -r ../../common/requirements.txt -r requirements.txt
pip install --target=".python_packages/lib/site-packages" ../../common
```

You may get some warnings when installing these dependencies; they can be ignored.

You can now exit the container to run the rest of the steps.

Deploy the function app using the Azure Functions Core Tool.

```sh
func azure functionapp publish <function app name> --python --no-build
```

You can find the function app name in the outputs of the Terraform run; it should look like this: `functrigger-stg-xxxx`.

Repeat the same steps for the `func_dataproc` function app:

- Change to the `src/python/functions/func_dataproc` folder.
- In the container, go to the `/app/functions/func_dataproc` directory.
- Use the same `pip install` commands.
- When deploying, the function app name will look like: `funcdataproc-stg-xxxx`.

## Deploy the .NET app

Change to the target app directory:

```sh
cd src/dotnet/functions/func_extract
```

Build the app using the .NET CLI:

```sh
dotnet restore
dotnet build --configuration Release
```

Deploy the function app using the Azure Functions Core Tool.

```sh
func azure functionapp publish <function app name> --dotnet
```
