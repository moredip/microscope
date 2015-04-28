#!/bin/bash

function install_neo4j() {
  export DEBIAN_FRONTEND=noninteractive
  wget -O - http://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
  echo 'deb http://debian.neo4j.org/repo stable/' > /etc/apt/sources.list.d/neo4j.list
  apt-get update
  apt-get -y install neo4j
}
which neo4j-shell > /dev/null || install_neo4j

#function setup_ruby() {
  #apt-get install ruby2.0
  #gem2.0 install bundler
#}
#setup_ruby
