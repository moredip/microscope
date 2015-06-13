root_dir="$( cd "$( dirname "$0" )" && pwd )"

mkdir -p $root_dir/../tmp
cd $root_dir/../tmp

curl -O https://download.elasticsearch.org/logstash/logstash/logstash-1.4.0.tar.gz
tar zxvf logstash-1.4.0.tar.gz   

