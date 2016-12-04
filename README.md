# Getting started

To play with microscope you can stand up a local vagrant-based ELK setup by running:
```
./go local
```

You can use some scripts to create some fake log entries in your vagrant setup:
```
cd dev-tooling/ELK_loaders
./download_logstash_locally.sh
../generate_fake_call_tree 1000 | ./load_faked_call_trace_into_ElK.sh
```

Some useful links now that you have a running local setup:

- use microscope to analyze your fake logs: [http://localhost:8081/microscope/](http://localhost:8081/microscope/)
- use Kibana to view the raw logs: [http://localhost:8081/kibana/](http://localhost:8081/kibana/index.html#/dashboard/file/logstash.json)
- use Kopf to view the state of your Elasticsearch cluster: [http://localhost:8081/admin/](http://localhost:8081/admin/)
