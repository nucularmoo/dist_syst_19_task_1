const uuidv1 = require('uuid/v1');
const express = require('express');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const app = express();
app.use(express.json());
const port = 3000;
// generate the guid we'll be using for identification of users
const CLIENT_ID = uuidv1();

let clients = [
  {
    'ip': '127.0.0.1',
    'port': '3000',
    'guid': 'dfghhhs-asdffadsfasd-dfsadfsffds-adfsdafsdf',
    'name': 'bob',
  },
];

let scores = [
  {
    'guid': 'dfghhhs-asdffadsfasd-dfsadfsffds-adfsdafsdf',
    'name': 'bob',
    'timestamp': '2019-11-11T12:45',
    'score': "20",
  },
];

// default endpoint
app.get('/', (req, res) => res.send('Hello World!'));

// add new player to client list
// in: guid, ip, port, name
// out: client list, score list
app.post('/connect', (req, res) => {
  const ip = req.body.ip;
  const port = req.body.port;
  const guid = req.body.guid;
  const name = req.body.name;

  const player = {
    ip,
    port,
    guid,
    name,
  };

  clients.push(player);

  console.log(`Got a new player: ${player.name} (${player.guid}) at ${player.ip}:${player.port}`);
  console.log(clients);

  res.send('ok');
});

// remove client from client list
// in: guid
app.post('/disconnect', (req, res) => {
  const guid = req.body.guid;
  clients = clients.filter(c => c.guid != guid);
  console.log(clients);
  res.send('ok');
});

// receive a new score
// in: guid, name, timestamp, score
app.post('/score', (req, res) => {
  const guid = req.body.guid;
  // TODO shouldn't be required in here
  const name = req.body.name;
  const timestamp = req.body.timestamp;
  const score = req.body.score;

  const scoreThing = {
    guid,
    name,
    timestamp,
    score,
  };

  scores.push(scoreThing);

  console.log(`Got a new score from ${scoreThing.name} (${scoreThing.guid}): ${scoreThing.score} at ${scoreThing.timestamp}`);

  res.send('ok');
});

// endpoint for client list
// out: client list
app.get('/clients', (req, res) => res.json(clients));

// endpoint for score list
// out: score list
app.get('/scores', (req, res) => res.json(scores));

// obligatory endpoint for node status
// out: status of the node
app.get('/status', (req, res) => res.send('ok'));

// for debug purposes
// out: clients, scores
app.get('/debug/state', (req, res) => res.json({clients, scores}));

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
