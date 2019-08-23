import {GLOBALS} from './globals';

export const parseMQTTString = path => {
  return `${GLOBALS.mqttBase}${path}`;
};
