import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {GLOBALS} from './globals';
import {
  genericInitial,
  mqttPublish,
  defaultForSet,
} from './func';

const initialized = new Initialized('AI');

const {
  Pin,
} = five;

export const AI = {
  board: null,
  active: true,
  interval: 2*1000,
  threshold: 2,
  condenserPde: {
    type: 'pde',
    name: 'Condenser PDE',
    pin: 55, //A1
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      defaultForSet(this,value);
      this.value = value;
    },
    threshold: 2,
    defrostPa: 40, // ?
    cleanPa: 25,
    limitingPa: 50, // ?
    warningPa: 60, // ?
    counterResetMillis: 5*1000,
    counterLastResetMillis: 0,
    mqttCommand: '',
    mqttState: 'hp/condenserPde',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: AI.interval, threshold: AI.threshold}),
      initialized.done(this.name);
    },
  },

};

AI.onChanges = () => {
  console.log("Mapping AI onChanges");
  Object.keys(AI).map(key => {
    const instance = AI[key];
    if(key !== "board" && typeof instance !== null && typeof instance === 'object') {
      if(instance.output !== null) {
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
