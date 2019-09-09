import five from 'johnny-five';
import mqtt from 'mqtt';

import {GLOBALS} from './includes/globals';
import {IO} from './includes/io';
import {SECRETS} from './secrets.js';
import {DO} from './includes/do';
import {DI} from './includes/di';
import {AO} from './includes/ao';
import {AI} from './includes/ai';
import {LOGIC} from './includes/logic';
import {HP} from './includes/hp';

import {
  unixtimestamp,
  mqttSubscriptions,
  mqttOnMessage,
  mqttCommandTopics,
} from './includes/func';

const {
  mqttServer,
  mqttUser,
  mqttPass,
} = SECRETS;

const mqttClient = mqtt.connect(mqttServer, {username: mqttUser, password: mqttPass});
const board = new five.Board({timeout: 3600});


mqttClient.commandTopics = mqttCommandTopics(); // create dynamic mqttCommandTopics array to mqttClient instance
board.mqttClient = mqttClient; // inject mqttClient to board instance

console.log(unixtimestamp());

board.on("ready", function() {

  GLOBALS.startupTimestamp = unixtimestamp();
  this.wait(GLOBALS.startupTime, () => {
    GLOBALS.starting = false;
    LOGIC.loop();
    HP.loop();
  });

  IO.initial(this);

  this.repl.inject({
    info: () => console.log("Hello, this is your info :D"),
  });

  // clear stuff
  this.on("exit", function() {
    // TODO: shutdown everything!!
  });

});


board.on("close", function() {
  console.log("Board closed :/");
});


mqttClient.on('connect', function() {
  // create subscriptions dynamically:
  mqttSubscriptions(mqttClient);

  // test subscribe
  mqttClient.subscribe('state/iot/heatpump/online', (err) => {
    if(!err) {
      // reply with publish
      mqttClient.publish('state/iot/heatpump/online', 'hello');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  if(GLOBALS.debug) {
    console.log("topic",topic.toString());
    console.log("message",message.toString());
  }

  // handle mqtt messages dynamically..
  // based on dynamically created mqttCommandTopics array
  mqttOnMessage(mqttClient,topic,message);
});

mqttClient.on('error', err => {
  console.error("mqttClient error", err);
});
