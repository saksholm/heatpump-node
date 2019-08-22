const five = require("johnny-five");
import {io} from './includes/io';
import {GLOBALS} from './includes/globals';
import {DO} from './includes/do';
import {DI} from './includes/di';
import {AO} from './includes/ao';
import {AI} from './includes/ai';
import {logic} from './includes/logic';
import {

} from './includes/func';

const board = new five.Board({timeout: 3600});

board.on("ready", function() {

  io.initial(this);

  this.repl.inject({
    info: () => {
      console.log("DO ahuFan", DO.ahuFan);
//      DO.ahuFan.initial(five);

    },

    ledOutput: value => {
      DO.ahuFanOutput.set(value);
    },
  });


  // clear stuff

  this.on("exit", function() {
    // TODO: shutdown everything necessary!!
  });

});


board.on("close", function() {
  console.log("Board closed :/");
});
