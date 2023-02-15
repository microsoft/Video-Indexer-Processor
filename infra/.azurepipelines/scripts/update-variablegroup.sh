#!/bin/bash

set -e

export DEVOPS_ORGANIZATION=$1
export DEVOPS_PROJECT=$2
export GROUP_NAME=$3

# configure the azure devops cli
az devops configure --defaults organization=${DEVOPS_ORGANIZATION} project=${DEVOPS_PROJECT} --use-git-aliases true

# get the variable group id (if already exist)
group_id=$(az pipelines variable-group list --group-name ${GROUP_NAME} --query '[0].id' -o json)

if [ -z "${group_id}" ]; then
    # create a new variable group
    tf_output=$(terraform output -json | jq -r 'to_entries[] | "\(.key)=\(.value.value)"')
    az pipelines variable-group create --name ${GROUP_NAME} --variables ${tf_output} --authorize true
else
    # get existing variables
    var_list=$(az pipelines variable-group variable list --group-id ${group_id})

    # add temporary uuid variable (a variable group cannot be empty) 
    uuid=$(cat /proc/sys/kernel/random/uuid)
    az pipelines variable-group variable create --group-id ${group_id} --name ${uuid}

    # delete existing variables 
    for row in $(echo ${var_list} | jq -r 'to_entries[] | "\(.key)"'); do
        az pipelines variable-group variable delete --group-id ${group_id} --name ${row} --yes
    done

    # create variables with latest values (from terraform)
    for row in $(terraform output -json | jq -c 'to_entries[]'); do
        _jq()
        {
            echo ${row} | jq -r ${1}
        }

        az pipelines variable-group variable create --group-id ${group_id} --name $(_jq '.key') --value $(_jq '.value.value') --secret $(_jq '.value.sensitive') 
    done

    # delete temporary uuid variable
    az pipelines variable-group variable delete --group-id ${group_id} --name ${uuid} --yes
fi
