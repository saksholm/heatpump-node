import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('AO');

const AO = {
  board: null,
  AO1: 'AO1',
};

AO.initial = board => {
  if(AO.board === null) {
    AO.board = board;
  }

  Object.keys(AO).map((key,index) => {
    const instance = AO[key];

    if(key !== "board" && typeof instance !== null && instance && typeof instance.initial === "function") {
      instance.initial(five);
    }
  });
  console.log("AO initial setup............................................... DONE");
}



export {AO};
