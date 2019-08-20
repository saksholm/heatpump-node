const DI = {
  DI1: 'DI1',
};

const DO = {
  ahu_fan: {
    pin: '13',
    value: false, // true/false
    mqttCommand: '',
    mqttState: '',
    on: function() {
      console.log("turn on ahu_fan", this);
    },
    off: function() {
      console.log("turn off ahu_fan", this);
    },
  },
};

const AI = {
  AI1: 'AI1',
};

const AO = {
  AO1: 'AO1',
};

export {
  DI,
  DO,
  AI,
  AO,
};
