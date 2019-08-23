//import five from 'johnny-five';
//const board = new five.Board();
import {GLOBALS} from './globals';
import {DO} from './do';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';
import {TH} from './th';
import {HP} from './hp';

const io = {};


io.initial = board => {
  console.log("Start initialising io's");
  DO.initial(board);
  DI.initial(board);
  AO.initial(board);
  AI.initial(board);
  TH.initial(board);
  HP.initial(board);
};



export {io};
