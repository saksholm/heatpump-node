//import five from 'johnny-five';
//const board = new five.Board();
import {GLOBALS} from './globals';
import {
  DO,
  DOInitial,
} from './do';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';
import {
  TH,
  THInitial,
} from './th';

const io = {};


io.initial = board => {
  console.log("Start initialising io's");
  DOInitial(board);
  DI.initial(board);
  AO.initial(board);
  AI.initial(board);
  THInitial(board);
};



export {io};
