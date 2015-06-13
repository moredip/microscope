root_dir="$( cd "$( dirname "$0" )" && pwd )"

cd $root_dir

curl -O https://download.elasticsearch.org/logstash/logstash/logstash-1.4.0.tar.gz
tar zxvf logstash-1.4.0.tar.gz   
mv logstash-1.4.0 logstash
