const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io'); //1
const parseArgs = require('minimist');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const io = socketio(server);  //2

const args = parseArgs(process.argv.slice(2));
const { name = 'defaultServer', port = '8080'} = args;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
  res.json({
    headers: req.headers,
    address: req.connection.remoteAddress
  });
});

app.get('/api/name', (req, res) => {
  res.json({ name });
});

app.get('/api/file', (req, res) => {
  fs.readFile(`${__dirname}/version.txt`, 'utf8', (err, version) => {
    res.json({
      version,
      dirname: __dirname,
      cwd: process.cwd()
    });
  });
});
//Server                                             Client
//io.on('connection')                           <--- sock.on('connect') 
//                                                   every 1000ms 
//sock.on('heartbeat')       <---{timestapm:now}<--- sock.emit('hearbeat')                                  
//sock.emit('heatbeat')      --->{nodeName:name}---> sock.on('heartbeat') cal roundtrip time,append ul     

//step I 
//wait for client
io.on('connection', (sock) => {         //open for connection
  // 3  sock = connection from client
  console.log('Client connected');
                                        // Server 
  sock.on('heartbeat', (payload) => {   // get heartbeat from client, payload ={timestamp:now
    payload.nodeName = name;            // add payload.nodeName      
    sock.emit('heartbeat', payload);    // emit to client  , payload={...payload,nodeName:name}
  });

  sock.on('disconnect', () => {          // disconnect 
    console.log('Socket Disconnected');
  });
});

server.listen(+port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err.stack);
    return;
  }

  console.log(`Node [${name}] listens on http://127.0.0.1:${port}.`);
});
