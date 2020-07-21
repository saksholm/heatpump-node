import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {GLOBALS} from './globals';
import {
  genericInitial,
  mqttPublish,
  round2Decimals,
  calculateThermistorValue,
  validateTemperatures,
  setupDS18B20,
  setupI2C_DS18B20,
  handleI2C_TH_Data,
} from './func';
const {
  constrain,
  map,
  inRange,
  range,
  sum,
  toFixed,
  uid,

} = five.Fn;

const {
  Pin,
} = five;

const initialized = new Initialized('TH');

// https://create.arduino.cc/projecthub/TheGadgetBoy/ds18b20-digital-temperature-sensor-and-arduino-9cc806


export const TH = {
  board: null,
  interval: 5*1000, // 5sec
  threshold: 0.1, // TODO: implement this also
  changeIntervalMaxTimes: 10, // 10 times interval... OR changeIntervalMax...
  changeIntervalMax: 5*60*1000, //5mins


  thI2CReads: {}, // this is just initial.. contains all I2C data!!!

  outside: {
    type: 'I2C_DS18B20',
    name: 'Outside air temperature',
    lcdName: 'Outside',
    active: true,
    objectName: 'th1',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/outside',
    interval: 5*1000,//60*1000, // 1min
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  beforeCHG: {
    type: 'I2C_DS18B20',
    name: 'Before CHG air temperature',
    lcdName: 'BeforeCHG',
    active: true,
    objectName: 'th2',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/beforeCHG',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  betweenCHG_CX: {
    type: 'I2C_DS18B20',
    name: 'Between CHG-CX air temperature',
    lcdName: 'CHG-CX',
    active: true,
    objectName: 'th3',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/betweenCHG_CX',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  betweenCX_FAN: {
    type: 'I2C_DS18B20',
    name: 'Between CX-Fan air temperature',
    lcdName: 'CX-Fan',
    active: true,
    objectName: 'th4',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/betweenCX_FAN',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  exhaust: {
    type: 'I2C_DS18B20',
    name: 'Exhaust air temperature',
    lcdName: 'Exhaust',
    active: true,
    objectName: 'th5',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/exhaust',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  glygolIn: {
    type: 'I2C_DS18B20',
    name: 'Glygol In temperature',
    lcdName: 'GlygolIn',
    active: true,
    objectName: 'th6',
    value: 0,
    interval: 10*1000, // 10sec
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/glygolIn',
    output: null,
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  glygolOut: {
    type: 'I2C_DS18B20',
    name: 'Glygol Out temperature',
    lcdName: 'GlygolOut',
    active: true,
    objectName: 'th7',
    value: 0,
    interval: 10*1000, // 10sec
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/glygolOut',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  hotgas: {
    type: 'I2C_DS18B20',
    name: 'Hotgas temperature',
    lcdName: 'Hotgas',
    active: true,
    objectName: 'th8',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/hotgas',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  ahuCirculationSupply: {
    type: 'I2C_DS18B20',
    name: 'AHU Circulation Supply temperature',
    active: true,
    objectName: 'th9',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/ahuSupply',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  hxIn: {
    type: 'I2C_DS18B20',
    name: 'Heat Exchanger In water temperature',
    active: true,
    objectName: 'th10',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/hxIn',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  hxOut: {
    type: 'I2C_DS18B20',
    name: 'Heat Exchanger Out water temperature',
    active: true,
    objectName: 'th11',
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/hxOut',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  boilerUpper: {
    type: 'I2C_DS18B20',
    name: 'Boiler Upper water temperature',
    active: true,
    objectName: 'th12',
    value: 0,
    interval: 30*1000,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/boilerUpper',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  boilerMiddle: {
    type: 'I2C_DS18B20',
    name: 'Boiler Middle water temperature',
    active: true,
    objectName: 'th13',
    value: 0,
    interval: 30*1000,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/boilerMiddle',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },
  boilerLower: {
    type: 'I2C_DS18B20',
    name: 'Boiler Lower water temperature',
    active: true,
    objectName: 'th14',
    value: 0,
    interval: 30*1000,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/boilerLower',
    initial: function() {
      setupI2C_DS18B20(this, TH.board);
      initialized.done(this.name);
    },
  },

};

TH.onChanges = () => {

  console.log("Mapping TH onChanges");
  Object.keys(TH).map(key => {
    setTimeout(() => {
      const instance = TH[key];
      if(key !== "board" && typeof instance !== null && instance && instance.active) {
        if(instance.output !== null && instance.type === 'thermometer10k') {
          instance.output.on("data", function(value){

            const {celsius} = value;
            if(instance.value !== celsius) {
              const roundedCelsius = round2Decimals(celsius);
              if(typeof instance.threshold === "number") {
                // if change is gte/lte threshold
                if(roundedCelsius >= (instance.value + instance.threshold) || roundedCelsius <= instance.value - instance.threshold ) {
                  instance.set(roundedCelsius);
                  if(GLOBALS.debug && GLOBALS.printTH) console.log(`${instance.name} value changed to ${value}`);
                }
              } else {
                // set value just based on interval
                instance.set(roundedCelsius);
                if(GLOBALS.debug && GLOBALS.printTH) console.log(`${instance.name} value changed to ${value}`);
              }

            }

          });
          console.log(`TH, ${instance.name} onChanges watchers activated.... DONE`);
        }
        if(instance.output !== null && instance.type === 'DS18B20') {
          instance.output.on("error", function(err) {
            console.log(`Error on reading TH ${instance.name}: ${err}`);
          });

          instance.output.on("change", function() {
            const {celsius, address} = instance.output;
            if(validateTemperatures(celsius)) {
              if(GLOBALS.debug && GLOBALS.printTH) console.log(`Thermometer at address: 0x${address.toString(16)}`);
              if(GLOBALS.debug && GLOBALS.printTH) console.log(`TH ${instance.name} ${celsius}C`);
              instance.set(round2Decimals(celsius));
              if(GLOBALS.debug && GLOBALS.printTH) console.warn(`${instance.name} value changed to ${celsius}`);
            } else {
              console.log("ignoring temp", celsius, instance.name);
            }

          });
          console.log(`TH, ${instance.name} onChanges watchers activated.... DONE`);
        }

        if(instance.type === 'I2C_DS18B20') {

        }

      }


    }, 20000);
  });


  // I2C readings:

  setInterval(() => {
    // address 2
    // register 99 is spoofed (requested all temperatures)
    // bytes 28 = 14 temperatures, 2bytes each

    TH.board.i2cReadOnce(0x02, 99, 28, function(bytes) {
//     console.log("this is bytes", bytes);
     handleI2C_TH_Data(bytes, TH.thI2CReads);
    });
//    console.log("thObj", TH.thI2CReads);
}, 2000);

};




TH.initial = board => board.wait(5000, () => genericInitial(TH, 'TH', board, TH.onChanges));
