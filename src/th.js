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
  threshold: 2,

  outside: {
    type: 'DS18B20',
    name: 'Outside air temperature',
    active: true,
    pin: 35, // odd
//    address: 0x41771942bff,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/outside',
    output: null,
    interval: 60*1000, // 1min
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  beforeCHG: {
    type: 'DS18B20',
    name: 'Before CGH air temperature',
    active: true,
    pin: 36,
//    address: 0x41771942bff,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/beforeCHG',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);

    },
  },
  betweenCHG_CX: {
    type: 'DS18B20',
    name: 'Between CHG-CX air temperature',
    active: true,
    pin: 37,
//    address: 0x21316adc9aa,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/betweenCHG_CX',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  betweenCX_FAN: {
    type: 'DS18B20',
    name: 'Between CX-Fan air temperature',
    active: true,
    pin: 38,
//    address: 0x213137fbaaa,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/betweenCX_FAN',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  exhaust: {
    type: 'DS18B20',
    name: 'Exhaust air temperature',
    active: true,
    pin: 39,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/exhaust',
    output: null,
    initial: function() {

      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  glygolIn: {
    type: 'DS18B20',
    name: 'Glygol In temperature',
    active: true,
    pin: 40,
    pinMode: Pin.INPUT,
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
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  glygolOut: {
    type: 'DS18B20',
    name: 'Glygol Out temperature',
    active: true,
    pin: 41,
    pinMode: Pin.INPUT,
    value: 0,
    interval: 10*1000, // 10sec
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/glygolOut',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  hotgas: {
    type: 'DS18B20',
    name: 'Hotgas temperature',
    active: true,
    pin: 42,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/hotgas',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  fluidline: {
    type: 'DS18B20',
    name: 'Fluidline temperature',
    active: true,
    pin: 43,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/fluidline',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  hxIn: {
    type: 'DS18B20',
    name: 'Heat Exchanger In water temperature',
    active: true,
    pin: 44,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/hxIn',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  hxOut: {
    type: 'DS18B20',
    name: 'Heat Exchanger Out water temperature',
    active: true,
    pin: 45,
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/hxOut',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  boilerUpper: {
    type: 'DS18B20',
    name: 'Boiler Upper water temperature',
    active: true,
    pin: 46,
    pinMode: Pin.INPUT,
    value: 0,
    interval: 30*1000,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/boilerUpper',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  boilerMiddle: {
    type: 'DS18B20',
    name: 'Boiler Middle water temperature',
    active: true,
    pin: 47,
    pinMode: Pin.INPUT,
    value: 0,
    interval: 30*1000,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/boilerMiddle',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
      initialized.done(this.name);
    },
  },
  boilerLower: {
    type: 'DS18B20',
    name: 'Boiler Lower water temperature',
    active: true,
    pin: 48,
    pinMode: Pin.INPUT,
    value: 0,
    interval: 30*1000,
    set: function(value) {
      this.value = value;
      mqttPublish(TH.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '',
    mqttState: 'th/boilerLower',
    output: null,
    initial: function() {
      this.output = setupDS18B20(this);
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
      }


    }, 20000);
  });
};

TH.initial = board => genericInitial(TH, 'TH', board, TH.onChanges);
