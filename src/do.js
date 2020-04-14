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
  defaultForSet,
  increaseValue,
  decreaseValue,
  valueToOnOff,
} from './func';

import {HP} from './hp';
import {GLOBALS} from './globals';

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

export const DO = {
  board: null,
  ahuFan: {
    type: 'relay',
    name: 'AHU Fan',
    active: true,
    pin: 22,
//    pinMode: Pin.OUTPUT, // OUTPUT
    value: "off", // true/false
    enum: ["on","off"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      this.value = value;
      valueToOnOff(this);

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'ahu/ahuFan',
    mqttState: 'ahu/ahuFan',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("off");
      initialized.done(this.name);
    },
    repl: {
      ahuFan: function(value) { DO.ahuFan.set(value) },
    },
  },
  ahuFanOutput: {
    type: 'pwm',
    name: 'AHU Fan Output',
    active: true,
    pin: 6,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: 15,
    maxValue: 60,
    set: function(value) {
      defaultForSet(this,value);

      value = mapPercentToPWM(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, this.value);
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      // TODO: ramp?!? up/down
    },
    increase: (step=1) => increaseValue(this,step),
    decrease: (step=1) => decreaseValue(this,step),
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
    active: true,
    pin: 23,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "on", // true/false
    enum: ["on","off"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      this.value = value;
      valueToOnOff(this);

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/hpAllowed',
    mqttState: 'hp/hpAllowed',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("off");
      initialized.done(this.name);
    },
  },
  damperOutside: {
    type: 'relay',
    name: 'Damper outside',
    active: true,
    pin: 24,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "closed", // true/false
    enum: ["open","close"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      if(this.value === "open") {
        this.output.open();
        if(DO.damperConvection.value !== "close") DO.damperConvection.output.off(); //("close");
      }
      if(this.value === "close") {
        this.output.close();
        if(DO.damperConvection.value !== "open") DO.damperConvection.output.on(); //set("open");
      }
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    startDelay: 30*1000, //delay 180s-90deg.. wait 120s.... running... change lastTimestamp
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperOutside',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("close");
      initialized.done(this.name);
    },
  },
  damperConvection: {
    type: 'relay',
    name: 'Damper convection',
    active: true,
    pin: 25,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    enum: ["open","close"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      if(this.value === "open") {
        this.output.open();
        if(DO.damperOutside.value !== "close") DO.damperOutside.output.off(); //set("close");
      }
      if(this.value === "close") {
        this.output.close();
        if(DO.damperOutside.value !== "open") DO.damperOutside.output.on(); //set("open");
      }
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    repl: {
      damperConvectionOpen: function() {DO.damperConvection.set("open")},
      damperConvectionClose: function() {DO.damperConvection.set("close")},
    },
    startDelay: 30*1000, //delay 180s-90deg.. wait 120s.... running... change lastTimestamp
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperConvection',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("open");
      initialized.done(this.name);
    },
  },
  waterpumpCharging: {
    type: 'relay',
    name: 'Waterpump charging',
    active: true,
    pin: 26,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    enum: ["on","off"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      this.value = value;
      valueToOnOff(this);

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/waterpumpCharging',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("off");
      initialized.done(this.name);
    },
  },
  chgPumpRequest: {
    type: 'relay',
    name: 'CHG pump request',
    active: true,
    pin: 27,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    enum: ["on","off"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/chgPumpRequest',
    mqttState: 'hp/chgPumpRequest',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("off");
      initialized.done(this.name);
    },
  },
  hp4Way: {
    type: 'relay',
    name: 'HP 4-way valve',
    active: true,
    pin: 28,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "heating",
    enum: ["heating", "cooling"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      //TODO: check if stuff is running... cant change if running!!!
      this.value = value;

      if(this.value === "heating") this.output.on();
      if(this.value === "cooling") this.output.off();

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);    },
    mqttCommand: '', // not allowed!
    mqttState: 'hp/hp4Way',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set("heating");
      initialized.done(this.name);
    },
  },
  hpFan: {
    type: 'relay',
    name: 'HP fan',
    active: true,
    pin: 29,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: false, // true/false
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      if(typeof value !== 'boolean') value = convertStringToBoolean(value);
      this.value = value;
      relayOnOff(this);
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/hpFan',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
            this.set("off");
      initialized.done(this.name);
    },
  },
  hpFanOutput: {
    type: 'pwm',
    name: 'HP Fan Output',
    active: true,
    pin: 4,
    pinMode: Pin.PWM, // PWM
    value: 0,
    defaultValue: 20,
    minValue: HP.minFan,
    maxValue: HP.maxFan,
    set: function(value) {
      defaultForSet(this,value);

      this.value = constrain(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    increase: function(step=1){increaseValue(this,step)},
    decrease: function(step=1){decreaseValue(this,step)},
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
    active: true,
    pin: 7,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: 5, //TODO: should check what is the real minimum to use
    maxValue: 100,
    set: function(value) {
      defaultForSet(this,value);

      this.value = constrain(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    increase: function(step=1){increaseValue(this,step)},
    decrease: function(step=1){decreaseValue(this,step)},
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
    active: true,
    pin: 5,
    pinMode: Pin.PWM, // PWM
    value: 0,
    defaultValue: 20,
    minValue: HP.minPower,
    maxValue: HP.maxPower,
    set: function(value) {
      defaultForSet(this,value);

      // allow to set value only if allowedToRun is true
      if(HP.allowedToRun) {
        this.value = constrain(parseInt(value), this.minValue, this.maxValue);
        DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

        mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      }
      // TODO: ramp?!? up/down
    },
    increase: function(step=1){increaseValue(this,step)},
    decrease: function(step=1){decreaseValue(this,step)},
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
  hpCGValve: {
    type: 'relay',
    name: 'HP CG 3-way valve',
    active: true,
    pin: 0, // TODO: WTF!!
    pinMode: Pin.OUTPUT,
    value: "off",
    enum: ["on", "off"],
    relayType: 'NO',
    set: function(value) {
      defaultForSet(this,value);

      this.value = value;
      if(this.value === "on") this.output.on();
      if(this.value === "off") this.output.off();

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/hpCGValve',
    mqttState: 'hp/hpCGValve',
    output: null,
    repl: {
      hpCGValveOn: function() { DO.hpCGValve.set("on") },
      hpCGValveOff: function() { DO.hpCGValve.set("off") },
    },
    initial: function() {
      this.output = new five.Relay({
        pin: this.pin,
        type: this.relayType
      });

//      DO.board.repl.inject({hpCGValveOn: function() {DO.hpCGValve.output.on() } });
      this.set("off");
      initialized.done(this.name);

    },
  },

  // maapiiri pumppu
  // hx pumppu, restart delay
  // 4-way

/*
    pinMode(AO_3WAY, OUTPUT); // 3-way valve for cg
    pinMode(DO_4WAY, OUTPUT); // 4-way valve - heat/cooling .... ??? 0 = cooling, 1 = heating?
*/
};

DO.initial = board => genericInitial(DO, 'DO', board);
