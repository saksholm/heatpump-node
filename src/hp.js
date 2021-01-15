import five from 'johnny-five';
import {GLOBALS} from './globals';
const {DO} = require('./do'); //import {DO} from './do';
import {TH} from './th';
import {
//  unixtimestamp,
//  calculateTimeout,
//  mapPercentToPWM,
  genericInitial,
  mqttPublish,
} from './func'

const {
//  constrain,
} = five.Fn;

import {hpStop} from './hp.stop';
import {hpStart} from './hp.start';
import {hpLoop} from './hp.loop';


export const HP = {
  board: null,
  allowedToRun: false,
  manual: false,
  error: false,
  program: 'idle', // idle, stop, cooling, heating, heatToWater
  mode: 'stop', // idle, stop, stopping, starting, running, alarmA, alarmB, defrost
  alarmA: false,
  alarmB: false,
  alarmAReason: null,
  alarmBReason: null,
  running: false,
  lastStopTime: 0,
  minimumRunningTime: 60*2, // 1min
  actualRunStartTimestamp: 0,
  restartDelay: 60*5, // 5 mins
  restartTimestamp: 0,
  defrost: false,
  coolingDemand: false,
  maxHotgas: 80, // 80c
  maxHotgasEmergency: 90,
  hxInMaximum: 35,
  hxOutTarget: 40,
  cooling: {
    minAhuTemp: 17,
  },
  heating: {

  },
  hotgasWatchInterval: 15, // in seconds
  outputWatchInterval: 5, // in seconds
  fanWatchInterval: 15, // in seconds
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
    stopStep4: null,
    afterDry: null,
    defrost1: null,
    defrost2: null,
    defrost3: null,
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
HP.stop = (reason, emergency=false,callback=false) => hpStop(reason, emergency,callback);
HP.loop = () => hpLoop();
HP.initial = board => genericInitial(HP, 'HP', board);