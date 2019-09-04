

const GLOBALS = {
  debug: true,
  starting: true,
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
  relayLow: true,
  boiler: {
    upperHeatingResistorAllowed: true,
    lowerHeatingResistorAllowed: false,
    preventHeatingResistors: false,
    forceHeat: false,
    deadZone: 0.3,
    upper: {
      request: false,
      softMinimum: 40.0,
      softMaximum: 50.0,
      hardMinimum: 35.0,
      hardMaximum: 55.0,
    },
    middle: {
      request: false,
      softMinimum: 30.0,
      softMaximum: 40.0,
      hardMinimum: 25.0,
      hardMaximum: 45.0,
    },
    lower: {
      request: false,
      softMinimum: 10.0,
      softMaximum: 30.0,
      hardMinimum: 5.0,
      hardMaximum: 35.0,
    },

  },
  mqttBase: 'iot/heatpump',
};

export {
  GLOBALS,
};
