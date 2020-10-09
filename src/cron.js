//import {GLOBALS} from './globals';
import {LCD} from './lcd';

setTimeout(() => {
  // reset lcd screen if screen is active
  if(LCD.screen.active) {
    LCD.board.loop(LCD.screen.autoReset, () =>{
      LCD.screen.initial();
      LCD.screen.currentInstance();
    });
  }
},10000);
