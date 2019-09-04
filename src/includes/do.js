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
} from './func';

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
/*
const {
  analogRead,
  analogWrite,
  digitalRead,
  digitalWrite,
  pinMode,
  wait,
  loop,
} = DO.board;
*/
const {
  Pin,
} = five;

const DO = {
  board: null,
  ahuFan: {
    type: 'relay',
    name: 'AHU Fan',
    pin: 22,
    pinMode: Pin.OUPUT, // OUTPUT
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
      //this.output = five.PWM
      DO.board.analogWrite(this.pin, this.value);
      initialized.done(this.name);
    }
  },
  hpAllowed: {
//   const int     DO_HP_ALLOWED = 22; // DO 22 - HP Allowed
    type: 'relay',
    name: 'HP allowed',
    pin: 23,
    pinMode: Pin.OUPUT, // OUTPUT
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
//  const int     DO_DAMPER_OUTSIDE = 23; // DO 23 - Damper outside
    type: 'relay',
    name: 'Damper outside',
    pin: 24,
    pinMode: Pin.OUPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperOutside',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  damperConvection: {
//   const int     DO_DAMPER_CONVECTION = 29; // DO 29 ? - Damper convection
    type: 'relay',
    name: 'Damper convection',
    pin: 25,
    pinMode: Pin.OUPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
    },
    mqttCommand: '', // not allowed
    mqttState: 'hp/damperConvection',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  waterpumpCharging: {
//  const int     DO_WATERPUMP_CHARGING = 24; // DO 24 - Waterpump charging
    type: 'relay',
    name: 'Waterpump charging',
    pin: 26,
    pinMode: Pin.OUPUT, // OUTPUT
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
//   const int     DO_CHGPUMP_REQUEST = 25; // DO 25 - CHG pump request
    type: 'relay',
    name: 'CHG pump request',
    pin: 27,
    pinMode: Pin.OUPUT, // OUTPUT
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
//    const int     DO_4WAY = 27; // DO 27 - HP 4-way - heating/cooling
    type: 'relay',
    name: 'HP 4-way valve',
    pin: 28,
    pinMode: Pin.OUPUT, // OUTPUT
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
//  const int     DO_HP_FAN = 28; // DO 28 - HP Fan
    type: 'relay',
    name: 'HP fan',
    pin: 29,
    pinMode: Pin.OUPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      if(typeof value !== 'boolean') value = convertStringToBoolean(value);
      this.value = value;
      relayOnOff(this);
      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);
      // trigger something mqtt etc stuff?
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
    minValue: 15,
    maxValue: 60,
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
      //this.output = five.PWM
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
    minValue: 2,
    maxValue: 100,
    set: function(value) {
      this.value = constrain(value, this.minValue, this.maxValue);
      DO.board.analogWrite(this.pin, mapPercentToPWM(this.value, this.minValue, this.maxValue));

      mqttPublish(DO.board.mqttClient, this.mqttState, this.value);

      // TODO: ramp?!? up/down
    },
    increase: function(step=1) { if(step) this.set(this.value+step) },
    decrease: function(step=1) { if(step) this.set(this.value-step) },
    mqttCommand: '', // not allowed
    mqttState: 'hp/load2Way',
    output: null,
    initial: function() {
      DO.board.pinMode(this.pin, this.pinMode);
      //this.output = five.PWM
      DO.board.analogWrite(this.pin, this.value);
      initialized.done(this.name);
    }
  },
  hpOutput: {
    type: 'pwm',
    name: 'HP Output',
    pin: 5,
    pinMode: Pin.PWM, // PWM
    value: 0,
    minValue: 10,
    maxValue: 60,
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
  // maapiiri pumppu
  // hx pumppu, restart delay
  // hx venttiili, delay 90s-90deg.. wait 30s
  // damperOutside // delay 180s-90deg.. wait 120s.... running... change lastTimestamp
  // damperConvection // delay 180s-90deg.. wait 120s... running... change lastTimestamp
  // 4-way

/*


    pinMode(AO_HP, OUTPUT); // HP control signal
    pinMode(AO_2WAY, OUTPUT); // 2-way valve for limiting water flow over hx
    pinMode(AO_HP_FAN, OUTPUT); // HP circulation fan
  //  pinMode(AO_LF, OUTPUT); // Outside/convection damper
    pinMode(AO_3WAY, OUTPUT); // 3-way valve for cg
    pinMode(AO_AHU_FAN, OUTPUT); // AHU convection fan
    pinMode(DO_HP_ALLOWED, OUTPUT); // HP allowed
    pinMode(DO_DAMPER_CONVECTION, OUTPUT); // Damper outside
    pinMode(DO_DAMPER_OUTSIDE, OUTPUT); // HP outside
    pinMode(DO_HP_FAN, OUTPUT); //HP fan
    pinMode(DO_WATERPUMP_CHARGING, OUTPUT); // Charging waterpump
    pinMode(DO_CHGPUMP_REQUEST, OUTPUT); // CG pump request - some other's may also want this on
    pinMode(DO_AHU_FAN_ALLOWED, OUTPUT); // AHU convection fan allowed
    pinMode(DO_4WAY, OUTPUT); // 4-way valve - heat/cooling .... ??? 0 = cooling, 1 = heating?

*/
};

DO.initial = board => genericInitial(DO, 'DO', board);

export {DO};
