# dist_syst_19_task_1
Task 1

## Running

Currently only works on Linux and Windows with WSL.

Install docker, clone, then:

```
$ docker build -t ds19/task1 .
```

in separate shells, do:

```
$ docker run -e "CONNECT_TO=127.0.0.1:3000" -e "PORT=3000" -e "NAME=bob" --net=host -it ds19/task1
```

```
$ docker run -e "CONNECT_TO=127.0.0.1:3000" -e "PORT=3001" -e "NAME=bobby" --net=host -it ds19/task1
```

```
$ docker run -e "CONNECT_TO=127.0.0.1:3001" -e "PORT=3002" -e "NAME=bobbyboy" --net=host -it ds19/task1
```

and start playing.
