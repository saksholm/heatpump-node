import {
  Initialized,
} from './initialized.class';
import {genericInitial} from './func';

const initialized = new Initialized('AI');

const AI = {
  board: null,
  AI1: 'AI1',


  /*

  pinMode(AI_CONDENSER_PA, INPUT); // Pa over Condenser --- for melting purpose or limiting stuff...?

  */
};

AI.initial = board => genericInitial(AI, 'AI', board);

export {AI};
