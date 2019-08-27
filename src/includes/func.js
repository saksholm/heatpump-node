import five from 'johnny-five';
import getUnixTime from 'date-fns/getUnixTime';
import {GLOBALS} from './globals';

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

export const mapPercentToPWM = value => {
  value = constrain(value, 0, 100);
  return map(value, 0,100, 0,255);
};
