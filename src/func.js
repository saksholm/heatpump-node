import five from 'johnny-five';
import getUnixTime from 'date-fns/getUnixTime';
import Controller from 'node-pid-controller';
import {GLOBALS} from './globals';
import {DO} from './do';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';
import {TH} from './th';
import {HP} from './hp';

const {
  map,
  constrain,
} = five.Fn;

export const parseMQTTString = path => {
  return `${GLOBALS.mqttBase}${path}`;
};

export const unixtimestamp = (datetime=null, microtime=false) => {
  if(!datetime) datetime = new Date();
  if(microtime) return getUnixTime(datetime * 1000);
  return getUnixTime(datetime);
};

export const calculateTimeout = (timestamp, delay, milliseconds=false) => {
  let timeout;

  if( timestamp === 0) timeout = 0;
  if(timestamp !== 0) {
    if( timestamp + delay <= unixtimestamp() ) timeout = 0;
    if( unixtimestamp() - timestamp <= delay)  timeout = (timestamp + delay) - unixtimestamp();
  }
  if(milliseconds) return timeout * 1000;
  return timeout;
};

export const mapPercentToPWM = (value,min=false,max=false) => {
  value = parseInt(value);
  if(min && value < min) console.warn(`value (${value})is under minimum (${min})`);
  if(max && value > max) console.warn(`value (${value})is over maximum (${max})`);
  value = constrain(value, (min ? min : 0), (max ? max : 100));
  return map(value, 0,100, 0,255);
};

export const genericInitial = (module, name, board, callback=null) => {
  if(module.board === null) {
    module.board = board;
  }

  Object.keys(module).map(key => {
    const instance = module[key];

    if(
      key !== "board" &&
      typeof instance !== null &&
      instance &&
      instance.active
    ) {
      if(typeof instance.initial === "function") {
        instance.initial(board);
      }
      if(typeof instance.repl === "object") {
//        board.repl.inject(instance.repl);
        try {
          injectRepls(module,key);

        } catch(e) {
          console.err("genericInitial catch on repls inject",e);
        }
      }
    }
  });
  console.log(`${name} initial setup............................................... DONE\n`);
  if(callback) callback();
};

export const injectRepls = (module, key) => {

  setTimeout(() => {
    console.log(`injecting repl's from ${key}`);
    const repl = module[key].repl;

    module.board.repl.inject(repl);
  },200);
};


export const mqttSubscriptions = mqttClient => {
  Object.keys(DO).map(key => {
    const instance = DO[key];

    if(key !== "board" && typeof instance !== null && instance ) {
      if(typeof instance.mqttCommand === "string" && instance.mqttCommand !== "") {
        mqttClient.subscribe(`cmnd/${GLOBALS.mqttBase}/${instance.mqttCommand}`, (err) => {
          if(err) console.warn(`error in mqttSubscriptions, (${instance.mqttCommand}).. ${err}`);
          console.log(`Subscribed topic: ${instance.mqttCommand} ...`);
        });
      }
    }
  });
};


export const mqttPublish = (mqttClient,topic,value) => {
  const t = `state/${GLOBALS.mqttBase}/${topic}`;
  const v = typeof value !== "string" ? value.toString() : value;
  mqttClient.publish(t,v, (err) => {
    if(err) console.log(`mqttPublish (${t}) error: ${err}`);
  });
};

export const mqttCommandTopics = () => {
  const arr = [];

  Object.keys(DO).map(key => {
    const instance = DO[key];
    if(key !== "board" && typeof instance !== null && instance.mqttCommand) {
      if(typeof instance.mqttCommand === "string" && !!instance.mqttCommand) {

        const topic = `cmnd/${GLOBALS.mqttBase}/${instance.mqttCommand}`;

        switch(instance.type) {
          case 'pwm':
            arr.push({
              topic: topic,
              set: value => instance.set(value),
            });
            break;
          case 'relay':
            arr.push({
              topic: topic,
              set: value => instance.set(value),
            });
            break;
          default:
            console.warn("mqttCommandTopics, type not defined", instance.type);
        }

      }
    }

  });
  return arr;
};

export const mqttOnMessage = (mqttClient,topic,message) => {
  const {commandTopics} = mqttClient;
  console.log(commandTopics);
  commandTopics.filter(x => x.topic === topic).map(obj => {
    console.log(`Got message, topic: ${obj.topic}, msg buffer: ${message}, message str: ${message.toString()}, message type: ${typeof message}`);
    obj.set(message.toString());
  });
};

export const convertStringToBoolean = str => {
  str = str.toLowerCase();
  if(str === "true") return true;
  if(str === "false") return false;
  return str;
};

export const relayOnOff = instance => {
  switch (instance.value) {
    case true:
      console.log("turn on");
      instance.output.on();
      break;
    case false:
      console.log("turn off");
      instance.output.off();
      break;
  }
};

export const pidController = (p=0.25,i=0.01,d=0.01,time=1) => {
  return new Controller(p,i,d,time);
};

export const round2Decimals = value => {
  return Math.round(value * 100) / 100;
};


export const calculateThermistorValue = (raw, {beta, roomTemp, balanceResistor, resistorRoomTemp, maxAdc}) => {
  // (c) original idea is from: https://www.allaboutcircuits.com/projects/measuring-temperature-with-an-ntc-thermistor/

  const rThermistor = balanceResistor * ( (maxAdc / raw) - 1);
  const tKelvin = (beta * roomTemp) / (beta + (roomTemp * Math.log(rThermistor / resistorRoomTemp)));
  const tCelsius = tKelvin - 273.15;  // convert kelvin to celsius

  if(GLOBALS.debug) {
    console.log("calculateThermistorValue called raw:", raw);
    console.log("rThermistor", rThermistor);
    console.log("tKelvin", tKelvin);
    console.log("tCelsius", tCelsius);
  }

  return tCelsius;

};
