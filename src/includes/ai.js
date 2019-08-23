import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('AI');

const AI = {
  AI1: 'AI1',


  /*

  pinMode(AI_CONDENSER_PA, INPUT); // Pa over Condenser --- for melting purpose or limiting stuff...?

  */
};

AI.initial = function() {
  Object.keys(this).map((key,index) => {
    const instance = this[key];

    if(typeof instance.initial === "function") {
      instance.initial(five);
    }
  });
  console.log("AI initial setup............................................... DONE");
}

export {AI};
