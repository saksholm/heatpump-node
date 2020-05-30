import {GLOBALS} from './globals';
import {LCD} from './lcd';

setTimeout(() => {
  // reset lcd screen
  LCD.board.loop(LCD.screen.autoReset, () =>{
    LCD.screen.initial();
    LCD.screen.currentInstance();
  });
},10000);
