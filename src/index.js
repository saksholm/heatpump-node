import five from "johnny-five";
import {
  DI,
  DO,
  AI,
  AO,
} from './includes/io';
const board = new five.Board();


console.log("io's", DI,DO,AI,AO);

DO.ahu_fan.on();

/*

board.on("ready", function() {

  this.repl.inject({
    on: input => {
      console.log("on on on", typeof input, input);
    },
    off: input => {
      console.log("off off off", input);
    },
  });



  // clear stuff
  this.on("exit", function() {
    led.off();
  });

});
*/
