#!/bin/bash
set -e -u

# make sure we're always running from the same directory, regardless of what the 
# current working directory was when this script was run
my_dir="$( cd "$( dirname "$0" )" && pwd )"
root_dir="$my_dir/../.."
tools_dir="$root_dir/infra/managed_tools"
python_env_dir="$tools_dir/python_env"

if ! hash virtualenv 2>/dev/null
then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!!! virtualenv is not available !!!"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo 
  echo "to install virtualenv you can run something like: "
  echo "  sudo pip install virtualenv"
  echo 
  echo "if pip is not available, you can install it with something like: "
  echo "  sudo easy_install pip"
  echo
  echo "it easy_install is not available, you'll have to figure out how to install it on your own. :)"

  exit 1
fi

if [ ! -d $python_env_dir ]
then
  echo "setting up an isolated python environment with virtualenv..."

  #mkdir -p $python_env_dir
  virtualenv $python_env_dir
fi

"$python_env_dir/bin/pip" -q install ansible boto


