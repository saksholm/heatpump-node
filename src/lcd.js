import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';

import {TH} from './th';

import {genericInitial} from './func';

const initialized = new Initialized('LCD');

const LCD = {
  board: null,
  screen: {
    name: 'LCD Screen',
    type: 'lcd2004',
    rotateActive: false,
    rotateSpeed: 5*1000, // 5s.
    rotateHandler: null,
    rotateCurrent: 0,
    active: false,
    output: null,
    initial: function() {
      // I2C LCD, PCF8574
      // automatically uses and works only at pins 20 and 21 on Mega2560 board.

      this.output = new five.LCD({
        controller: "PCF8574T",
        rows: 4,
        cols: 20,
      });


      console.log("this output", this.output);
      initialized.done(this.name);
    },
    menus: {
      starting: function() {
        const lcd = LCD.screen.output;

        console.log("starting.... lcd", lcd);
        lcd.clear();
        lcd.cursor(0,0).print("hello world :D");
        lcd.cursor(1,0).print("lol");
        lcd.cursor(2,0).print("fffff");
        lcd.cursor(3,0).print("foobar");

/*
        let count = 0;
        setInterval(function() {
          // start screen rotation after 10s.
//          LCD.screen.startRotate();

//console.log(`Outside: ${TH.outside.value}`);
//console.log(`Before CHG: ${TH.beforeCHG.value}`);

          lcd.clear();
          lcd.cursor(0,0).print(`Outside: ${parseInt(count)}`);
          lcd.cursor(1,0).print(`Before CHG: ${parseInt(++count)}`);

          count++;
        }, 200);
*/
      },

      temperatures: function() {
        const lcd = LCD.screen.output;
          lcd.clear();
          lcd.cursor(0,0).print(`Outside: ${TH.outside.value}`);
          lcd.cursor(1,0).print(`Before CHG: ${TH.beforeCHG.value}`);
      },
    },
    startRotate: function () {
      this.rotateActive = true;
      this.rotateHandler = setInterval(function() {

        console.log("starting screen rotation");
        if(LCD.screen.rotateCurrent === 0) {
          LCD.screen.menus.temperatures();
          LCD.screen.rotateCurrent = 1;
        }
        if(LCD.screen.rotateCurrent === 1) {
          LCD.screen.menus.starting();
          LCD.screen.rotateCurrent = 0;
        }




      },this.rotateSpeed);
    },
    stopRotate: function() {
      this.rotateActive = false;
      clearInterval(this.rotateHandler);
    },

  },



};

LCD.initial = board => genericInitial(LCD, 'LCD', board, function() {
  if(LCD.screen.active) LCD.screen.menus.starting();

});

export {LCD};
