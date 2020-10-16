import {setCoolingDemand} from './hp.cooling';

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
  logicLoopLoad2WayLoopInterval: 10*1000,
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
    upper: { // middle upper!!
      request: false,
      softMinimum: 30.0,
      softMaximum: 45.0,
      hardMinimum: 25.0,
      hardMaximum: 60.0,
    },
    middle: { // middle lower
      request: false,
      softMinimum: 25.0,
      softMaximum: 40.0,
      hardMinimum: 20.0,
      hardMaximum: 60.0,
    },
    lower: { // bottom
      request: false,
      softMinimum: 20.0,
      softMaximum: 35.0,
      hardMinimum: 8.0,
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
