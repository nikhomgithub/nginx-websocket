const sock = io();

//const a = require('./util.js');
//a();

//========================
//Server                                             Client
//io.on('connection')                           <--- sock.on('connect') 
//                                                   every 1000ms 
//sock.on('heartbeat')       <---{timestapm:now}<--- sock.emit('hearbeat')                                  
//sock.emit('heatbeat')      --->{nodeName:name}---> sock.on('heartbeat') cal roundtrip time,append ul  

//Part 1
//setInterval(sendHeartbeat, 1000);   
//Step 1                   ---connect to server
sock.on('connect', () => {
  console.log('socket.io connected');
});
//==========================
//Step 2                   ---send heartbeat (timestamp) to server every 1000ms
const sendHeartbeat = () => {    
  sock.emit('heartbeat', {    
    timestamp: Date.now()  //payload=timestamp     
  });
};

setInterval(sendHeartbeat, 1000);                     
//==========================
const append = (parentId, text) => {
  const parent = document.getElementById(parentId);
  const item = document.createElement('li');
  item.innerHTML = text;
  parent.appendChild(item);
  parent.scrollTop = parent.scrollHeight;
};

const onHeartbeat = (payload) => {   //payload from client (timestamp) -> server(nodeName)
  console.log(payload)               //{timestamp: 1567049093570, nodeName: "default"}
  const roundtripTime = Date.now() - payload.timestamp;
  const { nodeName } = payload;
  append('log', `[${nodeName}]: ${roundtripTime}ms`);
};

//Step 3
sock.on('heartbeat', onHeartbeat);
//========================
//========================
//Part 2
//XMLHttpRequest is similar to  AJAX request
//reqXhr.open('GET', '/api/test');

const trimText = (max, text) => {
  return text.length < max ? text : text.substr(0, max - 3) + '...';
};

const sendXhr = () => {
  const reqXhr = new XMLHttpRequest();
  //reqXhr.readyState ==> current state of request
  // 0 = unsend , 1=open , 2 = head received, 3=loading, 4 =  done
  
  const log = append.bind(null,'api-test'); // <ul id="api-test"></ul>
  //define log is = append that bind with (parameter)
  log('Running XHR header test');
  //append('api-test','Running XHR header test')
  reqXhr.addEventListener('load', () => {
    const { status, statusText, responseText } = reqXhr;
    console.log(reqXhr)
    log(`Server response: ${status} [${statusText}]`);

    if (status < 200 || status > 299) {
      return;
    }

    const resp = JSON.parse(responseText);
    log('&nbsp;');
    log(`Connected from: ${resp.address}`);
    log('<strong>Headers (as node.js saw it)</strong>');
    Object.keys(resp.headers).forEach((key) => {
      log(`<strong>${key}</strong>: ${trimText(40, resp.headers[key])}`);
    })

  });

  reqXhr.addEventListener('error', (e) => {
    log('Could not reach server');
  });

  reqXhr.open('GET', '/api/test');
  reqXhr.send();
};

sendXhr();

//==================================
//==================================

//sock.on('msg', append.bind(null, 'log'));



//===================================
//===================================
//Part 3

// Set up click listener for button
//<a class="button ripple" id="get-node-name">Get Name</a>
//req.open('GET', '/api/name');

const button = document.querySelector('#get-node-name');
button.addEventListener('click', (e) => {
  e.preventDefault();

  const req = new XMLHttpRequest();

  req.addEventListener('load', () => {
    const { status, responseText } = req;
    if (status < 200 || status > 299) {
      return;
    }
    const resp = JSON.parse(responseText);

    document.querySelector('.node-name').innerHTML = resp.name;
    //<span class="node-name"></span>
  });

  req.open('GET', '/api/name');
  req.send();
});
