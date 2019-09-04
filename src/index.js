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


mqttClient.commandTopics = mqttCommandTopics(); // create dynamic mqttCommandTopics array
board.mqttClient = mqttClient; // inject mqttClient to board instance

console.log(unixtimestamp());

board.on("ready", function() {

  GLOBALS.startupTimestamp = unixtimestamp();
  this.wait(GLOBALS.startupTime, () => {
    GLOBALS.starting = false;
    LOGIC.loop();
  });

  IO.initial(this);

  this.repl.inject({
    info: () => {
      console.log("DO ahuFan", DO.ahuFan);
    },
    // test repl
    ledOutput: value => {
      DO.ahuFanOutput.set(value);
    },
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

  mqttSubscriptions(mqttClient);

//  mqttClient.subscribe('cmnd/iot/heatpump/hp/output');

  mqttClient.subscribe('state/iot/heatpump/online', (err) => {
    if(!err) {
      mqttClient.publish('state/iot/heatpump/online', 'hello');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log("topic",topic.toString());
  console.log("message",message.toString());

  mqttOnMessage(mqttClient,topic,message);

});

mqttClient.on('error', err => {
  console.error("mqttClient error", err);
});
