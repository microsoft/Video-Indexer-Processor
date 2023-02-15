# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 16, 14, 12, 16-bullseye, 14-bullseye, 12-bullseye, 16-buster, 14-buster, 12-buster
ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

# Install some basics packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y sudo git curl wget make procps python3-pip unzip pandoc jq black apt-transport-https

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

RUN npm install -g npm@8.7.0

RUN wget https://packages.microsoft.com/config/ubuntu/21.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    sudo dpkg -i packages-microsoft-prod.deb && rm packages-microsoft-prod.deb

RUN sudo apt-get update && sudo apt-get install -y dotnet-sdk-6.0

# Finish setting up $USERNAME (sudo, no password etc ...)
RUN echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg && \
    sudo mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/  && \
    wget -q https://packages.microsoft.com/config/debian/11/prod.list  && \
    sudo mv prod.list /etc/apt/sources.list.d/microsoft-prod.list  && \
    sudo chown root:root /etc/apt/trusted.gpg.d/microsoft.asc.gpg  && \
    sudo chown root:root /etc/apt/sources.list.d/microsoft-prod.list

RUN apt-get update && \
    apt-get install azure-functions-core-tools-4

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
RUN su node -c "npm install -g create-react-app"

# RUN curl -sL https://dot.net/v1/dotnet-install.sh | bash
