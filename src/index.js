const five = require("johnny-five");
var mqtt = require('mqtt')


import {io} from './includes/io';
import {GLOBALS} from './includes/globals';
import {secrets} from './secrets.js';
import {DO} from './includes/do';
import {DI} from './includes/di';
import {AO} from './includes/ao';
import {AI} from './includes/ai';
import {logic} from './includes/logic';
import {
  unixtimestamp,
  mqttSubscriptions,
  mqttOnMessage,
  mqttCommandTopics,
} from './includes/func';
import {HP} from './includes/hp';

const {
  mqttServer,
  mqttUser,
  mqttPass,
} = secrets;

const mqttClient = mqtt.connect(mqttServer, {username: mqttUser, password: mqttPass});
const board = new five.Board({timeout: 3600});

mqttClient.commandTopics = mqttCommandTopics();

board.mqttClient = mqttClient;

console.log(unixtimestamp());


board.on("ready", function() {

  GLOBALS.startupTimestamp = unixtimestamp();
  this.wait(GLOBALS.startupTime, () => {
    GLOBALS.starting = false;
  });

  io.initial(this);

  HP.start();

  this.repl.inject({
    info: () => {
      console.log("DO ahuFan", DO.ahuFan);
//      DO.ahuFan.initial(five);

    },

    ledOutput: value => {
      DO.ahuFanOutput.set(value);
    },
  });


  // clear stuff

  this.on("exit", function() {
    // TODO: shutdown everything necessary!!
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
//  mqttClient.end();


  mqttOnMessage(mqttClient,topic,message);

});

mqttClient.on('error', err => {
  console.error("mqttClient error", err);
});
