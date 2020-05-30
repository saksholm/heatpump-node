import five from 'johnny-five';
import {GLOBALS} from './globals';
import {DO} from './do';
import {TH} from './th';
import {
  unixtimestamp,
  calculateTimeout,
  mapPercentToPWM,
  genericInitial,
} from './func'

const {
  constrain,
} = five.Fn;

import {hpStop} from './hp.stop';
import {hpStart} from './hp.start';
import {hpLoop} from './hp.loop';


export const HP = {
  board: null,
  allowedToRun: false,
  error: false,
  mode: 'stop',
  running: false,
  lastStopTime: 0,
  minimumRunningTime: 60*3, // 3min
  actualRunStartTimestamp: 0,
  restartDelay: 60*5, // 5mins
  restartTimestamp: 0,
  defrost: false,
  maxPower: 25, // 0-100 ... not use directly
  minPower: 10, // 0-100 ... not use directly
  minFan: 10, // 0-100 ... not use directly
  maxFan: 60, // 0-100 ... not use directly
  maxHotgas: 80, // 80c
  maxFluidline: 30, // TODO: ask????
  hxInMaximum: 35,
  hxOutTarget: 40,
  hotgasWatchInterval: 15, // in seconds
  outputWatchInterval: 5, // in seconds
  fanWatchInterval: 10, // in seconds
  nextLoopIntervalTimestamps: { // object to handle interval check skips
    hotgas: 0,
    output: 0,
    fan: 0,
  },
  emergencyShutdown: false,
  mqtt: {
/*
    status: {
      topic: 'hp/status',
      value: {
        value: this.mode,
      }
    },
*/
    modeChange:{
      topic: 'hp/mode',
      value: {
        value: function(){ return this.mode}
      },
    },
    emergency: {
      topic: 'hp/status',
      value: {
        value: 'emergencyStop',
        name: 'Emergency Stop'
      }
    },
    defrost:{
      topic:'hp/status',
      value: {
        value: 'defrosting',
        name: 'Defrosting'
      }
    },
  },
  mqttStatus: function(val) {
    if(val) {
      if(Object.keys(HP.mqtt).includes(val)) {
        const {topic,value} = HP.mqtt[val];
        if(topic && value) mqttPublish(HP.board.mqttClient, topic, value);
      }
    }
  }
};

HP.start = () => hpStart();
HP.stop = () => hpStop();
HP.loop = () => hpLoop();
HP.initial = board => genericInitial(HP, 'HP', board);
