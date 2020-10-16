import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {GLOBALS} from './globals';
import {
  genericInitial,
//  mqttPublish,
  defaultForSet,
} from './func';

const initialized = new Initialized('AI');

const {
  Pin,
} = five;

export const AI = {
  board: null,
  active: false,
  interval: 2*1000,
  threshold: 2,
  condenserPde: {
    type: 'pde',
    active: true,
    name: 'Condenser PDE',
    pin: 55, //A1
    pinMode: Pin.INPUT,
    value: 0,
    scaleMin: 0, // Pa
    scaleMax: 200, // Pa
    set: function(value) {
      if(!defaultForSet(this,value)) return;
      this.value = value;
    },
    threshold: 2,

    // create a table of Pa's
    cleanPa: 25, // ? clean Pa with xx % fan
    limitingPa: 40, // ? limit power?
    defrostPa: 50, // ?
    warningPa: 60, // ?
    counterResetMillis: 5*1000,
    counterLastResetMillis: 0,
    mqttCommand: '',
    mqttState: 'hp/condenserPde',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: AI.interval, threshold: AI.threshold});
      initialized.done(this.name);
    },
  },
  filterGuard: {
    active: true,
    type: 'pde',
    name: 'Filter Guard',
    pin: 56, // A2
    pinMode: Pin.INPUT,
    interval: 60*1000, // 1min
    threshold: 2,
    value: 0,
    scaleMin: 0, // Pa
    scaleMax: 200, // Pa
    cleanPa: 30, // TBD
    changeNotificationPa: 50, // TBD
    dirtyPa: 60, // TBD
    hpFanSpeedToTest: 70, // hpFanOutput: 70% ???
    // TBD: circulation or outside mode ?!

    set: function(value) {
      if(!defaultForSet(this,value)) return;
      this.value = value;
    },
    mqttCommand: '',
    mqttState: 'hp/filterGuard',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: this.interval, threshold: this.threshold});
      initialized.done(this.name);
    },
  },
};

AI.onChanges = () => {
  console.log("Mapping AI onChanges");
  Object.keys(AI).map(key => {
    const instance = AI[key];
    if(key !== "board" && instance !== null && typeof instance === 'object') {
      if(instance.output !== null) {
        instance.output.on("change", function(value){
          instance.set(value);
          if(GLOBALS.debug) console.log(`${instance.name} value changed to ${value}`);
        });
        console.log(`AI, ${instance.name} onChanges watchers activated.... DONE`);
      }
    }
  });
};


AI.initial = board => genericInitial(AI, 'AI', board, AI.onChanges);
