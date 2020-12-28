import {setCoolingDemand} from './hp.cooling';

const GLOBALS = {
  version: '0.2',
  status: 'starting',
  debug: false,
  dryRun: false,
  printTH: false,
  starting: true,
  activePins: [],
  timersTH: [],
  startupTime: 30*1000, // 20sec to not start hp
  logicLoopInterval: 1*1000,
  logicLoopLoad2WayLoopInterval: 10*1000,
  startupTimestamp: 0,
  lastRunTime: 0, // seconds
  afterDryLimit: 45*60,
  afterDryTime: 40*60,
  afterDryTimeShort: 5*60,
  afterDryHpFanOutput: 60,
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
      demand: true,
      softMinimum: 30.0,
      softMaximum: 40.0,
      hardMinimum: 25.0,
      hardMaximum: 60.0,
    },
    middle: { // middle lower
      request: false,
      demand: true,
      softMinimum: 25.0,
      softMaximum: 37.0,
      hardMinimum: 20.0,
      hardMaximum: 60.0,
    },
    lower: { // bottom
      request: false,
      demand: false,
      softMinimum: 20.0,
      softMaximum: 30.0,
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
  debugLevels: {
    load2WayControllerPid: false,
    hpFanOutput: false,
    hpOutput: false,
    th: false,
  },

};


export {GLOBALS};
