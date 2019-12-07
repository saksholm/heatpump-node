import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {
  genericInitial,
  mqttPublish,
  unixtimestamp,
} from './func';
import {GLOBALS} from './globals';
import {HP} from './hp.js';

const initialized = new Initialized('DI');

const {
  Pin,
} = five;

export const DI = {
  board: null,
  interval: 1*1000,
  hpAlarm: {
    type: 'digitalIn',
    name: 'HP Alarm',
    pin: 30,
    pinMode: Pin.INPUT, // INPUT pulldown!!
    value: 0, // 0 = false, 1 = true .... pull down
    set: function(value) {
      this.value = value;
      if(value !== null) mqttPublish(DI.board.mqttClient, this.mqttState, this.value);
    },
    interval: 200,
    mqttCommand: '',
    mqttState: 'hp/hpAlarm',
    output: null,
    initial: function() {
      this.output = new five.Sensor.Digital(this.pin);
      initialized.done(this.name);
    },
  },
  kwhMeterPulse: {
    active: true,
    type: 'pulseIn',
    name: 'kWh pulse in',
    scale: 10000,
    pin: 31,
    pinMode: Pin.INPUT,
    value: 0,
    valuePerHour: 0,
    counter: 0,
    counterResetMillis: 10*1000,
    counterLastResetMillis: 0,
    lastState: null,
    output: null,
    interval: 1,
    initial: function() {
      if(this.output === null) this.output = new five.Sensor.Digital({pin: this.pin, freq: this.interval, threshold: 0});
    },
    set: function(watts, wattsPerHour) {
      this.value = watts;
      this.valuePerHour = wattsPerHour;
    },
    handlePulses: function(value) {
      if(value !== null) {
        // expecting that 0 is "to down from high, pulse shit :GGG"
        if((this.counterLastResetMillis + this.counterResetMillis) <= unixtimestamp(null, true)) {
          // calculate new value
          const actualMillisDiff = unixtimestamp(null, true) - this.counterLastResetMillis;
          const watts = this.counter * 10; // 1 pulse = 0.1W
          const wattsPerHour = (watts / (actualMillisDiff/1000)) * 360;

          this.set(watts, wattsPerHour);
          // at the end.. refresh counterLastResetMillis and counter;
//          console.log("COUNTTERI HIPOO, watts, wattsPerHour, actualMillisDiff", this.counter, parseFloat(watts).toFixed(2), parseFloat(wattsPerHour).toFixed(2), actualMillisDiff);
          this.counter = 0;
          this.counterLastResetMillis = unixtimestamp(null,true);
        }

        if(this.lastState !== null) {
          // changed
          if(this.lastState !== value) {
            this.counter++;
            this.lastState = value;
          }
        } else {
          this.lastState = value; // only 1 time....
          console.log("this appears only 1 time...");
        }
      }
    },
    mqttCommand: '',
    mqttState: 'hp/kwhMeterPulse',

  },
  chargingWaterpumpFlow: {
    type: 'flow',
    name: 'Waterpump flow',
    scale: 100, // ??? l/min
    q: 5.5,
    pin: 32,
    pinMode: Pin.INPUT,
    value: 0,
    valuePerMin: 0,
    counter: 0,
    counterLastResetMillis: 0,
    counterResetMillis: 5*1000,
    lastState: null,
    set: function(litres, litrePerMin) {
      this.value = litres;
      this.valuePerMin = litrePerMin;
//      mqttPublish(DI.board.mqttClient, this.mqttState, this.value);
    },
    interval: 1,
    mqttCommand: '', // not in pulse
    mqttState: 'hp/chargingWaterpumpFlow',
    output: null,
    handleFlow: function(value) {
      if(value !== null) {
        // expecting that 0 is "to down from high, pulse shit :GGG"
        if((this.counterLastResetMillis + this.counterResetMillis) <= unixtimestamp(null, true)) {
          // calculate new value
          const actualMillisDiff = unixtimestamp(null, true) - this.counterLastResetMillis;
          const litres = this.counter / 60 / this.q; // get some formula here?!?!
          const litrePerHour = (this.counter * (60/actualMillisDiff) ) / this.q;

//          const litrePerHour = (this.counter * (60/(actualMillisDiff/1000)) ) / 5.5;

          // count * 60 / 5.5 === litres per hour.... / 60 = per min


          this.set(litres, litrePerHour);
          // at the end.. refresh counterLastResetMillis and counter;
//          console.log("COUNTTERI HIPOO, litres, litrePerMin, actualMillisDiff", this.counter, parseFloat(litres).toFixed(2), parseFloat(litrePerHour).toFixed(2), actualMillisDiff);
          this.counter = 0;
          this.counterLastResetMillis = unixtimestamp(null,true);
        }

        if(this.lastState !== null) {
          // changed
          if(this.lastState !== value) {
            this.counter++;
            this.lastState = value;
          }
        } else {
          this.lastState = value; // only 1 time....
          console.log("this appears only 1 time...");
        }
      }
    },
    initial: function() {
      this.output = new five.Sensor.Digital({pin: this.pin, freq: this.interval, threshold: 0});
/*
      DI.board.pinMode(this.pin, this.pinMode);

      this.counterLastResetMillis = unixtimestamp(null, true);

      DI.board.loop(this.interval,() => {
        DI.board.digitalRead(this.pin, value => {
          // expecting that 0 is "to down from high, pulse shit :GGG"
          if((DI.chargingWaterpumpFlow.counterLastResetMillis + DI.chargingWaterpumpFlow.counterResetMillis) <= unixtimestamp(null, true)) {
            // calculate new value
            const actualMillisDiff = unixtimestamp(null, true) - DI.chargingWaterpumpFlow.counterLastResetMillis;
            const litres = DI.chargingWaterpumpFlow.counter * 4.8; // get some formula here?!?!
            const litrePerMin = (litres / 5) * 60;

            DI.chargingWaterpumpFlow.set(litres, litrePerMin);
            // at the end.. refresh counterLastResetMillis and counter;

            DI.chargingWaterpumpFlow.counter = 0;
            DI.chargingWaterpumpFlow.counterLastResetMillis = unixtimestamp(null,true);
          }

          if(DI.chargingWaterpumpFlow.lastState !== null) {
            // changed
            if(DI.chargingWaterpumpFlow.lastState !== value) {
              DI.chargingWaterpumpFlow.counter++;
            }
          }

          DI.chargingWaterpumpFlow.lastState = value;
        });
      });
*/
    },
    mqttCommand: '',
    mqttState: 'hp/chargingWaterpumpFlow',

  },
  threePhaseMonitor: {
    type: 'button',
    name: '3-Phase Monitor',
    pin: 33,
    pinMode: Pin.INPUT, // INPUT pulldown!!
    value: 0, // 0 = false, 1 = true .... pull down ?!?!??!?!?
    set: function(value) {
      this.value = value;
      if(value !== null) mqttPublish(DI.board.mqttClient, this.mqttState, this.value);
      // TODO: if value is false -> trigger HP emergency stop
      if(this.value === 1) {
        console.log("\n\n\n3~ PHASE MONITOR is FAILING... \n\n\nstopping HP NOW...\n\n\n");
        HP.stop(true);
      }

    },
    interval: 200,
    mqttCommand: '',
    mqttState: 'hp/threePhaseMonitor',
    output: null,
    initial: function() {
      this.output = new five.Button({pin: this.pin, isPullup: true});
      initialized.done(this.name);
    },
  },

};

DI.onChanges = () => {
  console.log("Mapping DI onChanges");
  Object.keys(DI).map(key => {
    const instance = DI[key];
    if(key !== "board" && typeof instance !== null && typeof instance === 'object') {
//      console.log("typeof output", typeof instance.output, key);
      if(typeof instance.output !== 'undefined' && instance.output !== null) {
        if(instance.type === "flow") {
          instance.output.on("data", function() {
            instance.handleFlow(instance.output.value);
          });
        } else if(instance.type === "pulseIn") {
          instance.output.on("data", function(){
            instance.handlePulses(instance.output.value);
          });
        } else if(instance.type === "button") {
          instance.output.on("down", function() {
            instance.set(1);
          });
          instance.output.on("up", function() {
            instance.set(0);
          });
        }else {
          instance.output.on("change", function(){
            instance.set(instance.output.value);
            //if(GLOBALS.debug) console.log(`${instance.name} value changed to ${instance.output.value}`);
          });
          console.log(`DI, ${instance.name} onChanges watchers activated.... DONE`);
        }
      }
    }
  });
};

DI.initial = board => genericInitial(DI, 'DI', board, DI.onChanges);
