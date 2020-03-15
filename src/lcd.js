import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';

import {genericInitial} from './func';

const initialized = new Initialized('AO');

const LCD = {
  board: null,
  screen: {
    name: 'LCD Screen',
    rotateActive: false,
    rotateSpeed: 5*1000, // 5s.
    rotateHandler: null,
    active: false,
    output: null,
    initial: function() {
      // I2C LCD, PCF8574
      // automatically uses and works only at pins 20 and 21 on Mega2560 board.
      /*
      this.output = new five.LCD({
        controller: "PCF8574",
        rows: 4,
        cols: 20,
      });
      */
//      initialized.done(this.name);
    },
    menus: {
      starting: function() {
        const lcd = this.output;
        lcd.cursor(0,0).print("hello world :D");
        lcd.cursor(1,0).print("lol");
        lcd.cursor(2,0).print("fffff");
        lcd.cursor(3,0).print("foobar");

        setTimeout(function() {
          // start screen rotation after 10s.
          this.startRotate();
        }, 10*1000);
      },
    },
    startRotate: function () {
      this.rotateActive = true;
      this.rotateHandler = setInterval(function() {

        console.log("starting screen rotation");

        // some logics here

      },this.rotateSpeed);
    },
    stopRotate: function() {
      this.rotateActive = false;
      clearInterval(this.rotateHandler);
    },

  },



};

LCD.initial = board => genericInitial(LCD, 'LCD', board, function(LCD) {
  //LCD.screen.menus.starting();
});

export {LCD};
