import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('AI');

const AI = {
  board: null,
  AI1: 'AI1',


  /*

  pinMode(AI_CONDENSER_PA, INPUT); // Pa over Condenser --- for melting purpose or limiting stuff...?

  */
};

AI.initial = board => {
  if(AI.board === null) {
    AI.board = board;
  }
  Object.keys(AI).map((key,index) => {
    const instance = AI[key];

    if(key !== "board" && typeof instance !== null && instance && typeof instance.initial === "function") {
      instance.initial(board);
    }
  });
  console.log("AI initial setup............................................... DONE");
}

export {AI};
