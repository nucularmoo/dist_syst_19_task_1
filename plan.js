const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const uuidv1 = require('uuid/v1');
const express = require('express');
const app = express();
const port = 3000;
const CLIENT_ID = uuidv1();

let clients = [
    {
        'ip': '127.0.0.1',
        'port': '3000',
        'id': 'dfghhhs-asdffadsfasd-dfsadfsffds-adfsdafsdf',
        'name': 'bob',
    },
];

let scores = [
    {
        'id': 'dfghhhs-asdffadsfasd-dfsadfsffds-adfsdafsdf',
        'name': 'bob',
        'timestamp': '2019-11-11T12:45',
        'score': 20,
    },
];

// default endpoint
app.get('/', (req, res) => res.send('Hello World!'));

// add new player to client list
// in: guid, ip, port, name
// out: client list, score list
app.post('/connect', (req, res) => res.send('ok'));

// remove client from client list
// in: guid
app.post('/disconnect', (req, res) => res.send('ok'));

// receive a new score
// in: guid, score
app.post('/score', (req, res) => {
    scores.append(req.json.score);
    return res.send('ok');
});

// endpoint for client list
// out: client list
app.get('/clients', (req, res) => res.send(JSON.stringify(clients)));

// obligatory endpoint for node status
app.get('/status', (req, res) => res.send('ok');

// for debug purposes
// out: clients, scores
app.get('/debug/state', (req, res) => res.send(JSON.stringify(scores)));

// generate guid

app.listen(port, () =>
  readline.question('give name', (name) => {
    console.log(`Hi ${name}!`);
    // input player name

    // connect and listen (give one player ip)
    // send name and guid if connecting (register, connect)
    // receive initial client list from the player we connected to

    // keep track of scores in the background

    // play

    // send scores to all clients
    // show score status
    // keep playing
    // disconnect, notify clients
    readline.close();
  })
);
