#!/bin/bash
set -e -u

root_dir="$( cd "$( dirname "$0" )" && pwd )"

function check_for_aws_creds_in_env { 
  if [ -z ${AWS_ACCESS_KEY_ID:-} ]; then
    echo "An AWS_ACCESS_KEY_ID must be set to a non-null value in the environment"
    exit
  fi
  if [ -z ${AWS_SECRET_ACCESS_KEY:-} ]; then
    echo "An AWS_SECRET_ACCESS_KEY must be set to a non-null value in the environment"
    exit
  fi
}

function ensure_client_built {
  cd ${root_dir}/client
  npm install
  gulp build
}

function watch_client {
  cd ${root_dir}/client
  npm install
  (sleep 5 && open ./dist/index.html)&
  gulp watch
}

function using_isolated_ansible {
  cd ${root_dir}
  infra/local_scripts/ensure_ansible.sh
  set +u
  source infra/managed_tools/python_env/bin/activate
  set -u
}

function using_isolated_terraform {
  cd ${root_dir}
  infra/local_scripts/ensure_terraform.sh
  cd infra/managed_tools/terraform
}

function run_terraform {
  using_isolated_terraform

  terraform_dir="${root_dir}/infra/terraform"
  tfvars_path="${terraform_dir}/terraform.tfvars"

  if [ ! -f "${tfvars_path}" ]; then
    echo "To deploy to AWS you must create a terraform.tfvars file containing AWS credentials. Use ${tfvars_path}.sample as a template."
    exit 1
  fi

  ./terraform $* -var-file="${tfvars_path}" -state="${terraform_dir}/terraform.tfstate" $terraform_dir
}

function run_ansible_against_ec2 {
  using_isolated_ansible

  cd infra/ansible 

  pem_path="../microscope.pem"

  if [ ! -f "${pem_path}" ]; then
    echo "To provision on AWS you need a ${pem_path} file (in order to ssh into ec2 instances)."
    exit 1
  fi

  export ANSIBLE_HOST_KEY_CHECKING=False # with disposable/phoenix servers this is not really valuable
  ansible-playbook -i ec2.py -u ubuntu --private-key="${pem_path}" ec2_elasticsearch_playbook.yml
}

function provision_vagrant {
  using_isolated_ansible

  cd $root_dir/infra
  vagrant up --no-provision && vagrant provision

  echo 
  echo "local instance is up and running:"
  echo "open http://localhost:8081"
}

case "${1:-}" in 

'')
  echo -e "valid commands are:\n\tlocal\n\twatch-client\n\taws_provision\n\taws_deploy\n\taws_teardown\n\tterraform"
  ;;
aws_provision)
  run_terraform apply
  ;;
aws_teardown)
  run_terraform destroy
  ;;
terraform)
  shift
  run_terraform $*
  ;;
aws_deploy)
  check_for_aws_creds_in_env
  ensure_client_built
  run_ansible_against_ec2
  ;;
local)
  ensure_client_built
  provision_vagrant
  ;;
watch-client)
  watch_client
  ;;
*)
  echo 'unrecognized command'
  ;;
esac
