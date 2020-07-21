import five from 'johnny-five';
import {GLOBALS} from './globals';
import {DO} from './do';
import {TH} from './th';
import {
  unixtimestamp,
  calculateTimeout,
  mapPercentToPWM,
  genericInitial,
  mqttPublish,
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
  manual: true,
  error: false,
  mode: 'stop',
  alarmA: false,
  alarmB: false,
  alarmAReason: null,
  alarmBReason: null,
  running: false,
  lastStopTime: 0,
  minimumRunningTime: 60*3, // 3min
  actualRunStartTimestamp: 0,
  restartDelay: 60*5, // 5mins
  restartTimestamp: 0,
  defrost: false,
  coolingDemand: false,
  maxPower: 50, // 0-100 ... not use directly
  minPower: 10, // 0-100 ... not use directly
  minFan: 10, // 0-100 ... not use directly
  maxFan: 70, // 0-100 ... not use directly
  maxHotgas: 80, // 80c
  hxInMaximum: 35,
  hxOutTarget: 40,
  cooling: {
    minAhuTemp: 17,
  },
  heating: {

  },
  hotgasWatchInterval: 15, // in seconds
  outputWatchInterval: 5, // in seconds
  fanWatchInterval: 10, // in seconds
  nextLoopIntervalTimestamps: { // object to handle interval check skips
    hotgas: 0,
    output: 0,
    fan: 0,
  },
  timeoutHandlers: {
    startStep1: null,
    startStep2: null,
    stopStep1: null,
    stopStep2: null,
    stopStep3: null,
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
        value: function(){ return HP.mode},
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
        // TODO: maybe have to refactor this idea..
        if(topic && value) mqttPublish(HP.board.mqttClient, topic, value.value);
      }
    }
  }
};

HP.start = () => hpStart();
HP.stop = (emergency=false,callback=false) => hpStop(emergency,callback);
HP.loop = () => hpLoop();
HP.initial = board => genericInitial(HP, 'HP', board);
