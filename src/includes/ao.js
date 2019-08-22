import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('AO');

const AO = {
  initial: function(five) {
    Object.keys(this).map((key,index) => {
      const instance = this[key];

      if(typeof instance.initial === "function") {
        instance.initial(five);
      }
    });
    console.log("AO initial setup............................................... DONE");
  },
  AO1: 'AO1',
};

export {AO};
