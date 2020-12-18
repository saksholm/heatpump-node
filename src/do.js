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
//  pidController,
  defaultForSet,
  increaseValue,
  decreaseValue,
  valueToOnOff,
  initializePidController,
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
//  map,
//  inRange,
//  range,
//  sum,
//  toFixed,
//  uid,
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
      if(!defaultForSet(this,value)) return;

      this.value = value;
      valueToOnOff(this);

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'ahu/ahuFan',
    mqttState: 'ahu/ahuFan',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value);
      initialized.done(this.name);
    },
    repl: {
      ahuFan: value => DO.ahuFan.set(value),
      ahuFanOn: () => DO.ahuFan.set('on'),
      ahuFanOff: () => DO.ahuFan.set('off'),
      relay1: value => DO.ahuFan.set(value),
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
    maxValue: 100,
    set: function(value) {
      if(!defaultForSet(this,value)) return;
      this.value = value;

      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      // TODO: ramp?!? up/down
    },
    increase: (step=1) => increaseValue(this,step),
    decrease: (step=1) => decreaseValue(this,step),
    mqttCommand: 'ahu/ahuFanOutput',
    mqttState: 'ahu/ahuFanOutput',
    repl: {
      ahuFanOutput: value => DO.ahuFanOutput.set(value),
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
    value: "off", // true/false
    enum: ["on","off"],
    relayType: 'NC',
    set: function(value) {
      if(!defaultForSet(this,value)) return;

      this.value = value;
      valueToOnOff(this);

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/hpAllowed',
    mqttState: 'hp/hpAllowed',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value);
      initialized.done(this.name);
    },
    repl: {
      hpAllowed: value => DO.hpAllowed.set(value),
      hpAllowedOn: () => DO.hpAllowed.set('on'),
      hpAllowedOff: () => DO.hpAllowed.set('off'),
      relay2: value => DO.hpAllowed.set(value),
    },
  },
  damperOutside: {
    type: 'relay',
    name: 'Damper outside',
    active: true,
    pin: 24,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "close", // true/false
    enum: ["open","close"],
    relayType: 'NO',
    set: function(value, skip=false) {
      if(!defaultForSet(this,value)) return;

      this.value = value;

      if(this.value === "open") {
        this.output.open();

        // skip is used to prevent race condition
        if(!skip) {
          if(DO.damperConvection.value !== "close") {
            DO.damperConvection.set('close', true);
          }
        }
      }
      if(this.value === "close") {
        this.output.close();

        // skip is used to prevent race condition
        if(!skip) {
          if(DO.damperConvection.value !== "open") {
            DO.damperConvection.set('open', true);
          }
        }
      }

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    startDelay: 30*1000, //delay 180s-90deg.. wait 120s.... running... change lastTimestamp
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperOutside',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value);
      initialized.done(this.name);
    },
    repl: {
      damperOutside: value => DO.damperOutside.set(value),
      damperOutsideOpen: () => DO.damperOutside.set("open"),
      damperOutsideClose: () => DO.damperOutside.set("close"),
      relay3: value => DO.damperOutside.set(value),
    },
  },
  damperConvection: {
    type: 'relay',
    name: 'Damper convection',
    active: true,
    pin: 25,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "open", // true/false
    enum: ["open","close"],
    relayType: 'NO',
    set: function(value, skip=false) {
      if(!defaultForSet(this,value)) return;
      this.value = value;

      if(this.value === "open") {
        this.output.open();

        // skip is used to prevent race condition
        if(!skip) {
          if(DO.damperOutside.value !== "close") {
            DO.damperOutside.set('close', true);
          }
        }
      }
      if(this.value === "close") {
        this.output.close();

        // skip is used to prevent race condition
        if(!skip) {
          if(DO.damperOutside.value !== "open") {
            DO.damperOutside.set('open',true);
          }
        }
      }


      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    repl: {
      damperConvectionOpen: () => DO.damperConvection.set("open"),
      damperConvectionClose: () => DO.damperConvection.set("close"),
      damperConvection: value => DO.damperConvection.set(value),
      relay4: value => DO.damperConvection.set(value),
    },
    startDelay: 30*1000, //delay 180s-90deg.. wait 120s.... running... change lastTimestamp
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperConvection',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value);
      initialized.done(this.name);
    },
  },
  waterpumpCharging: {
    type: 'relay',
    name: 'Waterpump charging',
    active: true,
    pin: 26,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "off", // true/false
    enum: ["on","off"],
    relayType: 'NC',
    set: function(value) {
      if(!defaultForSet(this,value)) return;
      this.value = value;
      valueToOnOff(this);

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/waterpumpCharging',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value);
      initialized.done(this.name);
    },
    repl: {
      waterpumpCharging: value => DO.waterpumpCharging.set(value),
      waterpumpChargingOn: () => DO.waterpumpCharging.set('on'),
      waterpumpChargingOff: () => DO.waterpumpCharging.set('off'),
      relay5: value => DO.waterpumpCharging.set(value),
    },
  },
  chgPumpRequest: {
    type: 'relay',
    name: 'CHG pump request',
    active: true,
    pin: 27,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "off", // true/false
    enum: ["on","off"],
    relayType: 'NO',
    set: function(value) {
      if(!defaultForSet(this,value)) return;
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/chgPumpRequest',
    mqttState: 'hp/chgPumpRequest',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value);
      initialized.done(this.name);
    },
    repl: {
      chgPumpRequest: value => DO.chgPumpRequest.set(value),
      chgPumpRequestOn: () => DO.chgPumpRequest.set('on'),
      chgPumpRequestOff: () => DO.chgPumpRequest.set('off'),
      relay6: value => DO.chgPumpRequest.set(value),
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
    set: function(value, initial=false) {
      if(!defaultForSet(this,value)) return;

      //TODO: check if stuff is running... cant change if running!!!

      if(!['starting','stopping','heating','cooling','run'].includes(HP.mode) || initial === true) {
        this.value = value;
        if(this.value === "heating") this.output.close();
        if(this.value === "cooling") this.output.open();

        mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      } else {
        console.log("Not allowed in this mode...", HP.mode);
      }

    },
    mqttCommand: '', // not allowed!
    mqttState: 'hp/hp4Way',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin, this.relayType);
      this.set(this.value, true);
      initialized.done(this.name);
    },
    repl: {
      hp4Way: value => DO.hp4Way.set(value),
      hp4WayCooling: () => DO.hp4Way.set('cooling'),
      hp4WayHeating: () => DO.hp4Way.set('heating'),
      relay7: value => DO.hp4Way.set(value),
    },
  },
  hpFan: {
    type: 'relay',
    name: 'HP fan',
    active: true,
    pin: 29,
    pinMode: Pin.OUTPUT, // OUTPUT
    value: "off",
    enum: ['on','off'],
    relayType: 'NO',
    set: function(value) {
      if(!defaultForSet(this,value)) return;

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
      this.set(this.value);
      initialized.done(this.name);
    },
    repl: {
      hpFan: value => DO.hpFan.set(value),
      hpFanOn: () => DO.hpFan.set('on'),
      hpFanOff: () => DO.hpFan.set('off'),
      relay8: value => DO.hpFan.set(value),
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
    minValue: 10,
    maxValue: 60,
    set: function(value,skip=false) {
      if(!defaultForSet(this,value)) return;
      this.value = constrain(value, this.minValue, this.maxValue);

      DO.board.analogWrite(this.pin, skip ? this.value : mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    shutdown: function() {this.value = 0;},
    increase: function(step=1){increaseValue(this,step)},
    decrease: function(step=1){decreaseValue(this,step)},
    mqttCommand: 'hp/fanOutput',
    mqttState: 'hp/fanOutput',
    repl: {
      hpFanOutput: value => DO.hpFanOutput.set(value),
      hpFanOutputShutdown: () => DO.hpFanOutput.set(0,true),
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
    maxValueOnRunning: 85,
    target: null,
    set: function(value) {
      if(!defaultForSet(this,value)) return;

      this.value = constrain(value, this.minValue, HP.mode === 'run' ? this.maxValueOnRunning : this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    shutdown: function() {this.value = 0;},
    increase: function(step=1){increaseValue(this,step)},
    decrease: function(step=1){decreaseValue(this,step)},
    setTarget: function(value) {this.target = value},
    controller: null,
    controller_p: 0.01,//0.25,
    controller_i: 0.15,//0.01,
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

      this.initializeController();
//      this.controller = pidController(this.controller_p, this.controller_i, this.controller_d, this.controller_time);
      initialized.done(this.name);

    },
    initializeController: function() {
      this.target = HP.hxOutTarget;
      initializePidController(this, () => {
        this.set(this.minValue); // pre value if somehow changed to something else
        this.controller.setTarget(this.target);
      });
    },
    repl: {
      load2Way: value => DO.load2Way.set(value),
      load2WayPid: () => DO.load2Way.initializeController(),
      load2WayPidReset: () => DO.load2Way.controller.reset(),
      load2WaySetTarget: value => DO.load2Way.setTarget(value),
    },
  },
  hpOutput: {
    type: 'pwm',
    name: 'HP Output',
    active: true,
    mode: 'auto', // auto/fixed
    pin: 5,
    pinMode: Pin.PWM, // PWM
    value: 0,
    defaultValue: 20,
    minValue: 10,
    maxValue: 50,
    manualMax: 70,
    set: function(value, skip=false,manual=false) {
      if(!defaultForSet(this,value)) return;

      // allow to set value only if allowedToRun is true
//      console.log(`DEBUG: DO.hpOutput.set().. HP.allowedToRun: ${HP.allowedToRun} `);
      if(HP.allowedToRun || skip) {
        this.value = manual
          ? constrain(parseInt(value), this.minValue, this.manualMax)
          : skip
            ? parseInt(value)
            : constrain(parseInt(value), this.minValue, this.maxValue);
        DO.board.analogWrite(this.pin, skip ? value : mapPercentToPWM(this.value, this.minValue, this.maxValue));

        mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      }

    },
    setMode: function(value) {this.mode = value;},
    shutdown: function() {this.set( 0, true)}, //TODO: change this to more relevant
    increase: function(step=1){increaseValue(this,step)},
    decrease: function(step=1){decreaseValue(this,step)},
    mqttCommand: '', // not allowed
    mqttState: 'hp/hpOutput',
    repl: {
      hpOutput: value => DO.hpOutput.set(value, false,true),
      hpOutputShutdown: () => DO.hpOutput.set(0,true),
      hpOutputSetMode: value => { DO.hpOutput.setMode(value)},
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
    active: false,
    pin: 0, // TODO: WTF!!
    pinMode: Pin.OUTPUT,
    value: "off",
    enum: ["on", "off"],
    relayType: 'NO',
    set: function(value) {
      if(!defaultForSet(this,value)) return;

      this.value = value;
//      if(this.value === "on") this.output.on();
//      if(this.value === "off") this.output.off();
      relayOnOff();

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: 'hp/hpCGValve',
    mqttState: 'hp/hpCGValve',
    output: null,
    repl: {
      hpCGValveOn: () => DO.hpCGValve.set("on"),
      hpCGValveOff: () => DO.hpCGValve.set("off"),
    },
    initial: function() {
      this.output = new five.Relay({
        pin: this.pin,
        type: this.relayType
      });

//      DO.board.repl.inject({hpCGValveOn: function() {DO.hpCGValve.output.on() } });
      this.set(this.value);
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
