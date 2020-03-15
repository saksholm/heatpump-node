import five from 'johnny-five';
import mqtt from 'mqtt';
import EventEmitter from 'events';
EventEmitter.defaultMaxListeners = 200;

import {GLOBALS} from './globals';
import {IO} from './io';
import {SECRETS} from './secrets.js';
import {DO} from './do';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';
import {LCD} from './lcd';
import {LOGIC} from './logic';
import {HP} from './hp';

import {
  unixtimestamp,
  mqttSubscriptions,
  mqttOnMessage,
  mqttCommandTopics,
} from './func';

const {
  mqttServer,
  mqttUser,
  mqttPass,
} = SECRETS;

const mqttClient = mqtt.connect(mqttServer, {username: mqttUser, password: mqttPass});
const board = new five.Board({port: '/dev/cu.usbmodem14201', timeout: 3600});

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
    console.log("waiting for initialising");
    this.wait(5000, () => {
      console.log("init started");
      IO.initial(this);
    });
  } catch(e) {
    console.log("ERROR, in IO.initial catch",e);
  }

  this.repl.inject({
    info: () => console.log("Hello, this is your info :D"),
    stop: () => HP.stop(true),
    emergencyReset: () => {
      if(HP.emergencyShutdown) HP.emergencyShutdown = false;
    }
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
  });


});




board.on("error", function(error) {
  console.log("Board error", error);
});


board.on("close", function() {
  console.log("Board closed :/");
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
  console.log("ERROR, mqqtClient.on close catch",e);
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
  console.log("ERROR, mqttclient.on message catch",e);
}

try {
  mqttClient.on('error', err => {
    console.error("mqttClient error", err);
  });
} catch(e) {
  console.log("ERROR, mqttClient.on catch",e);
}
