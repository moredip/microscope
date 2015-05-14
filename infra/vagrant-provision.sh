#!/bin/bash

function install_neo4j() {
  export DEBIAN_FRONTEND=noninteractive
  wget -O - http://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
  echo 'deb http://debian.neo4j.org/repo stable/' > /etc/apt/sources.list.d/neo4j.list
  apt-get update
  apt-get -y install neo4j

  echo 'org.neo4j.server.webserver.address=0.0.0.0' >> /etc/neo4j/neo4j-server.properties
  echo 'dbms.security.auth_enabled=false' >> /etc/neo4j/neo4j-server.properties
}
which neo4j-shell > /dev/null || install_neo4j

setup_ruby() {
  apt-get install -y build-essential ruby-dev
  cd /vagrant
  gem install bundler
  bundle install --system
}
setup_ruby
