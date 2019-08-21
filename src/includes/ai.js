import {
  Initialized,
} from './func';

const initialized = new Initialized('AI');

const AI = {
  initial: function(five) {
    Object.keys(this).map((key,index) => {
      const instance = this[key];

      if(typeof instance.initial === "function") {
        instance.initial(five);
      }
    });
    console.log("AI initial setup............................................... DONE");
  },
  AI1: 'AI1',


  /*

  pinMode(AI_CONDENSER_PA, INPUT); // Pa over Condenser --- for melting purpose or limiting stuff...?

  */
};

export {AI};
