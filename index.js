const uuidv1 = require('uuid/v1');
const express = require('express');
const axios = require('axios').default;
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const app = express();
app.use(express.json());
const IP = process.env.IP|| '127.0.0.1';
const PORT = process.env.PORT || '3000';
// generate the guid that we'll be using for identification of users
const GUID = uuidv1();
const CONNECT_TO = process.env.CONNECT_TO || '127.0.0.1:3000';
const NAME = process.env.NAME || 'bob';

let clients = [
];

let scores = [
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

  addPlayer(ip, port, guid, name);

  res.send('ok');
});

// remove client from client list
// in: guid
app.post('/disconnect', (req, res) => {
  const guid = req.body.guid;
  clients = clients.filter(c => c.guid != guid);
  console.log(`Received a notification of disconnecting from: ${guid}`);
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

function addPlayer(ip, port, guid, name) {
  const player = {
    ip,
    port,
    guid,
    name,
  };

  clients.push(player);

  console.log(`Got a new player: ${player.name} (${player.guid}) at ${player.ip}:${player.port}`);
}

function connect(ip, port) {
  console.log(`Connecting to ${ip}:${port}`);

  // get the client list so we can join them
  const urlClients = `http://${ip}:${port}/clients`;
  axios.get(urlClients).then((response) => {
    // we need to add ourselves to the client list here so we can get
    // the messages too. this is stupid but that's how it is.
    addPlayer(IP, PORT, GUID, NAME);

    // add all the new clients to our list of clients
    response.data.forEach(c => clients.push(c));

    // make all the other clients know us
    response.data.forEach(c => {
      const payload = {ip: IP, port: PORT, guid: GUID, name: NAME};
      const urlConnect = `http://${c.ip}:${c.port}/connect`;
      axios.post(urlConnect, payload);
    });
  });
}

function disconnect() {
  clients.forEach(c => {
    console.log(`Sending a notification of disconnecting to ${c.ip}:${c.port}`);
    const payload = {guid: GUID};
    const url = `http://${c.ip}:${c.port}/disconnect`;
    axios.post(url, payload);
  });
}

function sendScore(score) {
  clients.forEach(c => {
    console.log(`Sending score to ${c.ip}:${c.port}`);
    const payload = {guid: GUID, name: NAME, timestamp: new Date().toISOString(), score};
    const url = `http://${c.ip}:${c.port}/score`;
    axios.post(url, payload);
  });
}

app.listen(PORT, () => {
  const ip = CONNECT_TO.split(':')[0];
  const port = CONNECT_TO.split(':')[1];
  connect(ip, port);

  readline.question('> ', (command) => {
    switch (command) {
    case 'score':
      const score = Math.floor((Math.random() * 20) + 1);
      sendScore(score);
      break;
    case 'disconnect':
      disconnect();
      break;
    default:
      break;
    }

    readline.close();
  });
});
