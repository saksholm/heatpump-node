const five = require("johnny-five");
import {
  Initialized,
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

const TH = {
  board: null,
  interval: 1*1000,
  threshold: 2,
  outside: {
    type: 'thermometer10k',
    name: 'Outside air temperature',
    pin: 'A1',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  beforeCHG: {
    type: 'thermometer10k',
    name: 'Before CGH air temperature',
    pin: 'A2',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  betweenCHG_CX: {
    type: 'thermometer10k',
    name: 'Between CHG-CX air temperature',
    pin: 'A3',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  betweenCX_FAN: {
    type: 'thermometer10k',
    name: 'Between CX-Fan air temperature',
    pin: 'A4',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  exhaust: {
    type: 'thermometer10k',
    name: 'Exhaust air temperature',
    pin: 'A5',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  glygolIn: {
    type: 'thermometer10k',
    name: 'Glygol In temperature',
    pin: 'A6',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  glygolOut: {
    type: 'thermometer10k',
    name: 'Glygol Out temperature',
    pin: 'A7',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  hotgas: {
    type: 'thermometer10k',
    name: 'Hotgas temperature',
    pin: 'A8',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  fluidline: {
    type: 'thermometer10k',
    name: 'Fluidline temperature',
    pin: 'A9',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  hxIn: {
    type: 'thermometer10k',
    name: 'Heat Exchanger In water temperature',
    pin: 'A10',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  hxOut: {
    type: 'thermometer10k',
    name: 'Heat Exchanger Out water temperature',
    pin: 'A11',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  boilerUpper: {
    type: 'thermometer10k',
    name: 'Boiler Upper water temperature',
    pin: 'A12',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  boilerMiddle: {
    type: 'thermometer10k',
    name: 'Boiler Middle water temperature',
    pin: 'A13',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },
  boilerLower: {
    type: 'thermometer10k',
    name: 'Boiler Lower water temperature',
    pin: 'A14',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: TH.interval, threshold: TH.threshold}),
      initialized.done(this.name);
    },
  },

};

const THInitial = board => {
  if(TH.board === null) {
    TH.board = board;
  }

  Object.keys(TH).map((key) => {
    const instance = TH[key];

    if(key !== "board" && typeof instance !== null && instance && typeof instance.initial === "function") {
      instance.initial(board);
    }
  });
  console.log("TH initial setup............................................... DONE");
};

export {
  TH,
  THInitial,
};
