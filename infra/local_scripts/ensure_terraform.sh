#!/bin/bash
set -e -u

terraform_version="0.5.3"

# make sure we're always running from the same directory, regardless of what the 
# current working directory was when this script was run
my_dir="$( cd "$( dirname "$0" )" && pwd )"

root_dir="$my_dir/../.."
terraform_dir="$root_dir/infra/managed_tools/terraform"

scratch_dir=$(mktemp -dt terraform_download)
function cleanup {
  rm -rf "$scratch_dir"
}
trap cleanup EXIT

function detect_platform_info {
  terraform_os=$(uname -s | tr '[:upper:]' '[:lower:]')

  case $(uname -m) in
    x86_64)
      terraform_arch="amd64"
      ;;
    i386)
      terraform_arch="386"
      ;;
    *)
      echo "unrecognized architecture: $(uname -m). I don't know which Terraform binary to download. Giving up."
      exit 1
      ;;
  esac
}


if [ ! -x "$terraform_dir/terraform" ]
then

  detect_platform_info
  terraform_url="http://dl.bintray.com/mitchellh/terraform/terraform_${terraform_version}_${terraform_os}_${terraform_arch}.zip"
  zip_path="$scratch_dir/tf.zip"

  echo 
  echo "Downloading Terraform binaries from $terraform_url"
  echo 

  curl -L $terraform_url -o $zip_path
  mkdir -p $terraform_dir
  unzip -q -d $terraform_dir $zip_path
fi
