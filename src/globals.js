//import {setCoolingDemand} from './hp.cooling';

const GLOBALS = {
  version: '0.2',
  status: 'starting',
  debug: false,
  dryRun: true,
  printTH: false,
  starting: true,
  activePins: [],
  timersTH: [],
  startupTime: 20*1000, // 20sec to not start hp
  logicLoopInterval: 1*1000,
  startupTimestamp: 0,
  hvacCooling: false,
  hvacDrying: false, // means cooling & after heating
  hvacHeating: false, // water or pump?!
  heatToWater: false,
  heatToGround: false,
  heatToAir: false,
  groundWarmerThanAir: false,
  deadZone: 0.3,
  relayLow: false,
  modesPriority: {
    drying: 1,
    cooling: 2,
    heatingToAir: 3,
    heatingToWater: 4,

  },
  boiler: {
    upperHeatingResistorAllowed: true,
    lowerHeatingResistorAllowed: false,
    preventHeatingResistors: false,
    forceHeat: false,
    deadZone: 0.3,
    upper: {
      request: false,
      softMinimum: 45.0,
      softMaximum: 55.0,
      hardMinimum: 40.0,
      hardMaximum: 80.0,
    },
    middle: {
      request: false,
      softMinimum: 25.0,
      softMaximum: 35.0,
      hardMinimum: 20.0,
      hardMaximum: 50.0,
    },
    lower: {
      request: false,
      softMinimum: 10.0,
      softMaximum: 25.0,
      hardMinimum: 5.0,
      hardMaximum: 40.0,
    },

  },
  mqttBase: 'iot/heatpump',

  mqttCommandSubscribes: [
    {
      type: 'func',
      topic: 'coolingDemand',
      func: value => setCoolingDemand(value),
    },
  ],
};


export {GLOBALS};
