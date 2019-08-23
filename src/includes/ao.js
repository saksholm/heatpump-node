import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('AO');

const AO = {
  AO1: 'AO1',
};

AO.initial = function() {
  Object.keys(this).map((key,index) => {
    const instance = this[key];

    if(typeof instance.initial === "function") {
      instance.initial(five);
    }
  });
  console.log("AO initial setup............................................... DONE");
}


export {AO};
