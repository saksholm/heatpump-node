const five = require("johnny-five");
import {
  Initialized,
} from './initialized.class';

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
    pin: 14,
    pinMode: Pin.OUPUT, // OUTPUT
    value: false, // true/false
    set: function(value) {
      this.value = value;
      // trigger something mqtt etc stuff?
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Relay(this.pin);
      initialized.done(this.name);
    },
  },
  ahuFanOutput: {
    type: 'pwm',
    name: 'AHU Fan Output',
    pin: 13,
    pinMode: Pin.PWM, // PWM
    value: 0,
    set: function(value) {
      this.value = constrain(value, 0, 255);
      DO.board.analogWrite(this.pin, this.value);

      // TODO: ramp?!? up/down
    },
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      DO.board.pinMode(this.pin, this.pinMode);
      //this.output = five.PWM
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
  const int     DO_HP_ALLOWED = 22; // DO 22 - HP Allowed
  const int     DO_DAMPER_OUTSIDE = 23; // DO 23 - Damper outside
  const int     DO_DAMPER_CONVECTION = 29; // DO 29 ? - Damper convection
  const int     DO_WATERPUMP_CHARGING = 24; // DO 24 - Waterpump charging
  const int     DO_CHGPUMP_REQUEST = 25; // DO 25 - CHG pump request
  const int     DO_AHU_FAN_ALLOWED = 26; // DO 26 - AHU Fan allowed
  const int     DO_4WAY = 27; // DO 27 - HP 4-way - heating/cooling
  const int     DO_HP_FAN = 28; // DO 28 - HP Fan


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

DO.initial = board => {

  if(DO.board === null) {
    DO.board = board;
  }

  Object.keys(DO).map(key => {
    const instance = DO[key];

    if(key !== "board" && typeof instance !== null && instance && typeof instance.initial === "function") {
      instance.initial(board);
    }
  });
  console.log("DO initial setup............................................... DONE");
}

export {DO};
