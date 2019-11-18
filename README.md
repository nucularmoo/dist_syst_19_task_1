# dist_syst_19_task_1
Task 1

## Running

### Linux (and Windows?)
Install docker, clone, then:

```
$ docker build -t ds19/task1 .
```

in separate shells, do:

```
$ docker run -e "CONNECT_TO=127.0.0.1:3000" -e "PORT=3000" -e "NAME=bob" --net=host --name node0 -it ds19/task1
```

```
$ docker run -e "CONNECT_TO=127.0.0.1:3000" -e "PORT=3001" -e "NAME=bobby" --net=host --name node1 -it ds19/task1
```

```
$ docker run -e "CONNECT_TO=127.0.0.1:3001" -e "PORT=3002" -e "NAME=bobbyboy" --net=host --name node2 -it ds19/task1
```

and start playing.

You can access the nodes at [http://localhost:3000](http://localhost:3000), [http://localhost:3001](http://localhost:3001), and [http://localhost:3002](http://localhost:3002).

### MacOS

First we need to create a network for our containers so they can communicate with each other:

```
$ docker network create ds19
```

Then check what kind of IPs the network has:

```
$ docker network inspect ds19 |grep Subnet
      "Subnet": "172.19.0.0/16",
```

So the containers will have IP addresses beginning from 172.19.0.2 and going upwards from there.


Then, in separate shells:

```
$ docker run -e "IP=172.19.0.2" -e "PORT=3000" -e "CONNECT_TO=127.0.0.1:3000" -e "NAME=bob" --network ds19 -p 3000:3000 --name node0 --it ds19/task1
```

```
$ docker run -e "IP=172.19.0.3" -e "PORT=3000" -e "CONNECT_TO=172.19.0.2:3000" -e "NAME=bobby" --network ds19 -p 3001:3000 --name node1 -it ds19/task1
```

```
$ docker run -e "IP=172.19.0.4" -e "PORT=3000" -e "CONNECT_TO=172.19.0.3:3000" -e "NAME=bobbyboy" --network ds19 -p 3002:3000 --name node0 -it ds19/task1
```

You can access the nodes at [http://localhost:3000](http://localhost:3000), [http://localhost:3001](http://localhost:3001), and [http://localhost:3002](http://localhost:3002).
