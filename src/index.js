import five from 'johnny-five';
import mqtt from 'mqtt';
import http from 'http';
import EventEmitter from 'events';
import memwatch from '@airbnb/node-memwatch';

EventEmitter.defaultMaxListeners = 200;

import {GLOBALS} from './globals';
import {IO} from './io';
import {SECRETS} from './secrets';
import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';
import {LCD} from './lcd';
import {LOGIC} from './logic';

import {
  unixtimestamp,
  mqttSubscriptions,
  mqttOnMessage,
  mqttCommandTopics,
  setStatus,
} from './func';

const {
  mqttServer,
  mqttUser,
  mqttPass,
} = SECRETS;

const requestLogs = [];
const server = http.createServer((req, res) => {
  requestLogs.push({ url: req.url, date: new Date() });
  res.end(JSON.stringify(requestLogs));
});

server.listen(3000);
console.log("Server listening to port 3000. Press Ctrl+C to stop it.");



const mqttClient = mqtt.connect(mqttServer, {username: mqttUser, password: mqttPass});
const board = new five.Board({
//  port: '/dev/ttyACM0', // '/dev/tty.usbmodem14101', // mega... otherwise it can try to connect to UNO
  timeout: 3600,
  samplingInterval: 1000,
});

try {
  mqttClient.commandTopics = mqttCommandTopics(); // create dynamic mqttCommandTopics array to mqttClient instance
  board.mqttClient = mqttClient; // inject mqttClient to board instance
} catch(e) {
  console.log("ERROR, mqttClient.commandTopics",e);
}


console.log(unixtimestamp());

board.on("ready", function() {
  GLOBALS.startupTimestamp = unixtimestamp();

  try{
    console.log("init started");
    IO.initial(this);
  } catch(e) {
    console.log("ERROR, in IO.initial catch",e);
  }

  this.repl.inject({
    info: () => console.log("Hello, this is your info :D"),
    stop: () => HP.stop(true),
    emergencyReset: () => {
      if(HP.emergencyShutdown) HP.emergencyShutdown = false;
    },
    hpMode: value => {
      if(HP.manual) {
        HP.mode = value;
      }
    },
  });

  // clear stuff
  this.on("exit", function() {
    // TODO: shutdown everything!!
  });

  console.log(`\nWaiting startupTime (${GLOBALS.startupTime/1000}s) to run out before starting loops`);
  this.wait(GLOBALS.startupTime, () => {
    GLOBALS.starting = false;
    LOGIC.loop();
    HP.loop();
    mqttClient.publish('state/iot/heatpump/hp/status', 'ready');
    setStatus('Ready');
  });


});




board.on("error", function(error) {
  console.log("Board error", error);
  setStatus('Board error');
});


board.on("close", function() {
  console.log("Board closed :/");
  setStatus('Board closed');
});

try {
  mqttClient.on('connect', function() {
    // create subscriptions dynamically:
    mqttSubscriptions(mqttClient);

    // test subscribe
    mqttClient.subscribe('state/iot/heatpump/hp/status', (err) => {
      if(!err) {
        // reply with publish
        mqttClient.publish('state/iot/heatpump/hp/status', 'initialising');
      }
    });
  });
} catch(e) {
  console.log("ERROR, mqttClient.on close catch",e);
}

try {
  mqttClient.on('message', (topic, message) => {
    if(GLOBALS.debug) {
      console.log("topic",topic.toString());
      console.log("message",message.toString());
    }

    // handle mqtt messages dynamically..
    // based on dynamically created mqttCommandTopics array
    mqttOnMessage(mqttClient,topic,message);
  });
} catch(e) {
  console.log("ERROR, mqttClient.on message catch",e);
}

try {
  mqttClient.on('error', err => {
    console.error("mqttClient error", err);
  });
} catch(e) {
  console.log("ERROR, mqttClient.on catch",e);
}

memwatch.on('stats', stats => {
//  console.log("memwatch stats: ", stats);
});
