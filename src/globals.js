import {
  setCoolingDemand,
} from './hp.cooling';
import {
  mqttPublish,
  resetAlarms,
} from "./func";
import {HP} from "./hp";

const GLOBALS = {
  version: '0.2',
  status: 'starting',
  debug: true,
  dryRun: false,
  printTH: false,
  starting: true,
  preventRun: false,
  activePins: [],
  timersTH: [],
  startupTime: 60*1000, // 60sec to not start hp
  logicLoopInterval: 1*1000,
  logicLoopLoad2WayLoopInterval: 10*1000,
  startupTimestamp: 0,
  lastRunTime: 0, // seconds
  afterDryLimit: 45*60,
  afterDryTime: 40*60,
  afterDryTimeShort: 5*60,
  afterDryHpFanOutput: 60,
  coolingTargetTemp: 15,
  hvacCooling: false,
  hvacDrying: false, // means cooling & after heating
  hvacHeating: false, // water or pump?!
  heatToWater: false,
  heatToGround: false,
  heatToAir: false,
  groundWarmerThanAir: false,
  deadZone: 0.3,
  relayLow: false,
  nightElectricity: {
    startHour: 22,
    endHour: 7,
    demand: false,
    forceHoursBeforeEnd: 2, // force x hours before nightElectricity ends... only if demand = true
  },
  boostHotWater: false,
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
      softMinimum: 34.0,
      softMaximum: 42.0, // 40.0,
      hardMinimum: 25.0,
      hardMaximum: 60.0,
    },
    middle: { // middle lower
      request: false,
      demand: true,
      softMinimum: 28.0, //25.0,
      softMaximum: 39.9, // 37.0,
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
      func: value => {
        setCoolingDemand(value);
        console.log("MQTT COMMAND :: setCoolingDemand", value);

      },
    },
    {
      type: 'func',
      topic: 'resetAlarms',
      func: () => {
        resetAlarms();
        console.log("MQTT COMMAND :: resetAlarms");
      },
    },
    {
      type: 'func',
      topic: 'emergencyReset',
      func: () => {
        if(HP.emergencyShutdown) HP.emergencyShutdown = false;
        console.log("MQTT COMMAND :: emergencyReset");
      },
    },
    {
      type: 'func',
      topic: 'commandTest',
      func: () => {
        console.log("MQTT COMMAND :: commandTest");
      },
    },
    {
      type: 'func',
      topic: 'nightElectricityOn',
      func: value => {
        console.log("MQTT COMMAND :: nightElectricityOn");
        if(value === 'on') {
          GLOBALS.nightElectricity.demand = true;
        }
        if(value === 'off') {
          GLOBALS.nightElectricity.demand = false;
        }
        mqttPublish(HP.board.mqttClient, 'hp/nightElectricityOn', value);

      },
    },
    {
      type: 'func',
      topic: 'boostHotWater',
      func: value => {
        console.log("MQTT COMMAND :: boostHotWater");
        if(value === 'on') {
          GLOBALS.boostHotWater = true;
        }
        if(value === 'off') {
          GLOBALS.boostHotWater = false;
        }
        mqttPublish(HP.board.mqttClient, 'hp/boostHotWater', value);
      },
    },
    {
      type: 'func',
      topic: 'preventRun',
      func: value => {
        console.log("MQTT COMMAND :: prevent run");
        if(value === 'on') {
          GLOBALS.preventRun = true;
        }
        if(value === 'off') {
          GLOBALS.preventRun = false;
        }
        mqttPublish(HP.board.mqttClient, 'hp/preventRun', value);
      },
    },

  ],
  debugLevels: {
    load2WayControllerPid: false,
    hpFanOutput: false,
    hpOutput: false,
    th: false,
    boilerDebug: false,
  },

};


export {GLOBALS};
