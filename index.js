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
const DEBUG = process.env.DEBUG === 'true' || false;

let clients = [
];

let scores = [
];

const logs = [
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
  log(`Received a notification of disconnecting from: ${guid}`);
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

  log(`Got a new score from ${scoreThing.name} (${scoreThing.guid}): ${scoreThing.score} at ${scoreThing.timestamp}`);

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

// for debug purposes
// out: logs of actions
app.get('/debug/logs', (req, res) => res.json({logs}));

function log(message) {
    const timestamp = new Date().toISOString();
    const logg = `[${timestamp}] ${message}`;

    if (DEBUG) {
        console.log(logg);
    }

    logs.push(logg);
}

function addPlayer(ip, port, guid, name) {
  const player = {
    ip,
    port,
    guid,
    name,
  };

  clients.push(player);

  log(`Got a new player: ${player.name} (${player.guid}) at ${player.ip}:${player.port}`);
}

function connect(ip, port) {
  log(`Connecting to ${ip}:${port}`);

  // get the client list so we can join them
  const urlClients = `http://${ip}:${port}/clients`;
  const urlScores = `http://${ip}:${port}/scores`;
  axios.get(urlClients).then((response) => {
    // we need to add ourselves to the client list here so we can get
    // the messages too. this is stupid but that's how it is.
    log(`Connected`);
    addPlayer(IP, PORT, GUID, NAME);

    // add all the new clients to our list of clients
    response.data.forEach(c => clients.push(c));

    // get the scores the other client has
    axios.get(urlScores).then((response) => {
      log(`Got scores`);
      scores = response.data;
    });

    // make all the other clients know us
    response.data.forEach(c => {
      const payload = {ip: IP, port: PORT, guid: GUID, name: NAME};
      const urlConnect = `http://${c.ip}:${c.port}/connect`;
      log(`Registering ourselves to ${c.ip}:${c.port}`);
      axios.post(urlConnect, payload);
    });
  });
}

function disconnect() {
  clients.forEach(c => {
    log(`Sending a notification of disconnecting to ${c.ip}:${c.port}`);
    const payload = {guid: GUID};
    const url = `http://${c.ip}:${c.port}/disconnect`;
    axios.post(url, payload);
  });
}

async function testMessaging(size) {
  if (clients.length == 0) {
    console.log(`No clients connected`);
    return;
  }
  let timesSum = 0;
  let successfulRequests = 0;
  function callback(time) {
    timesSum += time;
    successfulRequests++;
  };
  async function testRequests(callback) {
    const url = `http://${clients[0].ip}:${clients[0].port}/score`;
    const payloadSmall = {test: "TESTING"};
    const payloadAvg = {test: "TESTING", size: "medium"};
    const payloadBig = {test: "TESTING", size: "medium", isBiggest: "yes"};
    const payload = (size == "min" ? payloadSmall : (size == "avg" ? payloadAvg : payloadBig));
    for (let i = 0; i < 50; i++) {
      const startTime = Date.now();
      await axios.post(url, payload);
      const endTime = Date.now();
      const timeDelta = endTime - startTime;
      callback(timeDelta);
    }
  };
  await testRequests(callback);
  console.log(`Average request time: ${timesSum/successfulRequests} ms`);
}

function sendScore(score) {
  clients.forEach(c => {
    log(`Sending score to ${c.ip}:${c.port}`);
    const payload = {guid: GUID, name: NAME, timestamp: new Date().toISOString(), score};
    const url = `http://${c.ip}:${c.port}/score`;
    axios.post(url, payload);
  });
}

async function testMessaging() {
  if (clients.length == 0) {
    console.log(`No clients connected`);
    return;
  }
  let timesSum = 0;
  let successfulRequests = 0;
  function callback(time) {
    timesSum += time;
    successfulRequests++;
  };
  async function testRequests(callback) {
    const url = `http://${clients[0].ip}:${clients[0].port}/score`;
    const payload = {test: "TESTING"};
    for (let i = 0; i < 40; i++) {
      const startTime = Date.now();
      await axios.post(url, payload);
      const endTime = Date.now();
      const timeDelta = endTime - startTime;
      callback(timeDelta);
    }
  };
  await testRequests(callback);
  console.log(`Average request time: ${timesSum/successfulRequests} ms`);
}

function playGame() {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  console.log(`You rolled ${die1} and ${die2}`);
  return die1 + die2;
}

function printScores() {
  let sortedScores = [...scores];
  sortedScores.sort((a, b) => b.score - a.score);
  sortedScores = sortedScores.slice(0, 10);
  let i = 0;
  sortedScores.forEach(s => {
    console.log(`${i < 9 ? ' ' : ''}${++i}. ${s.score}${s.score < 10 ? ' ' : ''} (${s.name})`);
  });
}

function main() {
  readline.question('> ', function (command) {
    switch (command) {
    case 'play':
      const score = playGame();
      sendScore(score);
      break;
    case 'scores':
      printScores();
      break;
    case 'disconnect':
      disconnect();
      break;
    case 'quit':
      disconnect();
      process.exit();
      break;
    case 'tests':
      testMessaging("min");
      break;
    case 'testa':
      testMessaging("avg");
      break;
    case 'testb':
      testMessaging("max");
      break;
    default:
      break;
    }

    main();
  });
};

app.listen(PORT, () => {
  const ip = CONNECT_TO.split(':')[0];
  const port = CONNECT_TO.split(':')[1];
  connect(ip, port);

  main();
});
