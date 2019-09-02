import five from 'johnny-five';
import getUnixTime from 'date-fns/getUnixTime';
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

export const genericInitial = (module, name, board) => {
  if(module.board === null) {
    module.board = board;
  }

  Object.keys(module).map(key => {
    const instance = module[key];

    if(
      key !== "board" &&
      typeof instance !== null &&
      instance
    ) {
      if(typeof instance.initial === "function") {
        instance.initial(board);
      }
      if(typeof instance.repl === "object") {
        board.repl.inject(instance.repl);
      }
    }
  });
  console.log(`${name} initial setup............................................... DONE`);
};
