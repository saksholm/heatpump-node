import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {
  genericInitial,
  mapPercentToPWM,
  mqttPublish,
  convertStringToBoolean,
  relayOnOff,
  pidController,
} from './func';

import {HP} from './hp';

const initialized = new Initialized('DO');


/*
Mode    Value   Constant
INPUT	  0	      Pin.INPUT
OUTPUT	1	      Pin.OUTPUT
ANALOG	2	      Pin.ANALOG
PWM	    3	      Pin.PWM
SERVO	  4	      Pin.SERVO
*/

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

const DO = {
  board: null,
  ahuFan: {
    type: 'relay',
    name: 'AHU Fan',
    pin: 22,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'ahu/ahuFan',
    mqttState: 'ahu/ahuFan',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  ahuFanOutput: {
    type: 'pwm',
    name: 'AHU Fan Output',
    pin: 2,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: 15,
    maxValue: 60,
    set: function(value) {
      value = mapPercentToPWM(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, this.value);
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      // TODO: ramp?!? up/down
    },
    increase: function(step=1) { if(step) this.set(this.value+step) },
    decrease: function(step=1) { if(step) this.set(this.value-step) },
    mqttCommand: 'ahu/ahuFanOutput',
    mqttState: 'ahu/ahuFanOutput',
    repl: {
      ahuFanOutput: function(value) { DO.ahuFanOutput.set(value) }
    },
    output: null,
    initial: function() {
      DO.board.pinMode(this.pin, this.pinMode);
      DO.board.analogWrite(this.pin, this.value);
      initialized.done(this.name);
    }
  },
  hpAllowed: {
    type: 'relay',
    name: 'HP allowed',
    pin: 23,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/hpAllowed',
    mqttState: 'hp/hpAllowed',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  damperOutside: {
    type: 'relay',
    name: 'Damper outside',
    pin: 24,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    startDelay: 30*1000, //delay 180s-90deg.. wait 120s.... running... change lastTimestamp
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperOutside',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  damperConvection: {
    type: 'relay',
    name: 'Damper convection',
    pin: 25,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    startDelay: 30*1000, //delay 180s-90deg.. wait 120s.... running... change lastTimestamp
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperConvection',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  waterpumpCharging: {
    type: 'relay',
    name: 'Waterpump charging',
    pin: 26,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/waterpumpCharging',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  chgPumpRequest: {
    type: 'relay',
    name: 'CHG pump request',
    pin: 27,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/chgPumpRequest',
    mqttState: 'hp/chgPumpRequest',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  hp4Way: {
    type: 'relay',
    name: 'HP 4-way valve',
    pin: 28,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      //TODO: check if stuff is running... cant change if running!!!
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);    },
    mqttCommand: '', // not allowed!
    mqttState: 'hp/hp4Way',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  hpFan: {
    type: 'relay',
    name: 'HP fan',
    pin: 29,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      if(typeof value !== 'boolean') value = convertStringToBoolean(value);
      this.value = value;
      relayOnOff(this);
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/hpFan',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  hpFanOutput: {
    type: 'pwm',
    name: 'HP Fan Output',
    pin: 4,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: HP.minFan,
    maxValue: HP.maxFan,
    set: function(value) {
      this.value = constrain(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    increase: function(step=1) { if(step) this.set(this.value+step) },
    decrease: function(step=1) { if(step) this.set(this.value-step) },
    mqttCommand: 'hp/fanOutput',
    mqttState: 'hp/fanOutput',
    repl: {
      hpFanOutput: function(value) { DO.hpFanOutput.set(value) }
    },
    output: null,
    initial: function() {
      DO.board.pinMode(this.pin, this.pinMode);
      DO.board.analogWrite(this.pin, this.value);
      initialized.done(this.name);
    }
  },
  load2Way: {
    type: 'pwm',
    name: 'Load 2-Way output',
    pin: 3,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: 5, //TODO: should check what is the real minimum to use
    maxValue: 100,
    set: function(value) {

      this.value = constrain(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    increase: function(step=1) { if(step) this.set(this.value+step) },
    decrease: function(step=1) { if(step) this.set(this.value-step) },
    controller: null,
    controller_p: 0.25,
    controller_i: 0.01,
    controller_d: 0.01,
    controller_time: 2,
    startDelay: 10*1000, // delay 90s-90deg.. wait 30s
    mqttCommand: '', // not allowed
    mqttState: 'hp/load2Way',
    output: null,
    initial: function() {
      DO.board.pinMode(this.pin, this.pinMode);
      //this.output = five.PWM
      DO.board.analogWrite(this.pin, this.value);
      this.controller = pidController(this.controller_p, this.controller_i, this.controller_d, this.controller_time);
      initialized.done(this.name);

    }
  },
  hpOutput: {
    type: 'pwm',
    name: 'HP Output',
    pin: 5,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: HP.minPower,
    maxValue: HP.maxPower,
    set: function(value) {
      this.value = constrain(parseInt(value), this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      // TODO: ramp?!? up/down
    },
    increase: function(step=1) { if(step) this.set(this.value+step) },
    decrease: function(step=1) { if(step) this.set(this.value-step) },
    mqttCommand: '', // not allowed
    mqttState: 'hp/hpOutput',
    repl: {
      hpOutput: function(value) { DO.hpOutput.set(value)},
    },
    output: null,
    initial: function() {
      DO.board.pinMode(this.pin, this.pinMode);
      DO.board.analogWrite(this.pin, this.value);
      initialized.done(this.name);
    }
  },

  // 3-way valve for hp cg coil
  // maapiiri pumppu
  // hx pumppu, restart delay
  // 4-way

/*
    pinMode(AO_3WAY, OUTPUT); // 3-way valve for cg
    pinMode(DO_4WAY, OUTPUT); // 4-way valve - heat/cooling .... ??? 0 = cooling, 1 = heating?
*/
};

DO.initial = board => genericInitial(DO, 'DO', board);

export {DO};
