

const GLOBALS = {
  starting: true,
  startupTime: 20*1000, // 20sec to not start hp
  hvacCooling: false,
  hvacDrying: false, // means cooling & after heating
  hvacHeating: false, // water or pump?!
  heatToWater: false,
  heatToGround: false,
  heatToAir: false,
  groundWarmerThanAir: false,

  hp: {
    allowedToRun: false,
    error: false,
    running: false,
    lastStopTime: 0,
    minimumRunningTime: 60*5*1000, // 5min
    restartDelay: 60*5*1000, // 5mins
    maxPower: 50, // 0-100
    minPower: 10, // 0-100
    minFan: 10, // 0-100
    maxFan: 60, // 0-100
  },
  boiler: {
    upperHeatingResistorAllowed: true,
    lowerHeatingResistorAllowed: false,
    preventHeatingResistors: false,
    forceHeat: false,
    deadZone: 0.3,
    upper: {
      softMinimum: 40.0,
      softMaximum: 50.0,
      hardMinimum: 35.0,
      hardMaximum: 55.0,
    },
    middle: {
      softMinimum: 30.0,
      softMaximum: 40.0,
      hardMinimum: 25.0,
      hardMaximum: 45.0,
    },
    lower: {
      softMinimum: 10.0,
      softMaximum: 30.0,
      hardMinimum: 5.0,
      hardMaximum: 35.0,
    },

  },
  mqttBase: '/iot/heatpump/',
};

export {
  GLOBALS,
};
