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
    defaultRotateSpeed: 10*1000, // 10s.
    nextRotateSpeed: null,
    rotateHandler: null,
    activeInterval: null,
    nextScreen: "temperatures",
    active: true,
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

        console.log("starting.... lcd");
        lcd.clear();
        lcd.cursor(0,0).print("hello world :D");
        lcd.cursor(1,0).print("lol");
        lcd.cursor(2,0).print("fffff");
        lcd.cursor(3,0).print("foobar");
        lcd.cursor(0,49);

        setTimeout(function() {
          LCD.screen.nextRotateSpeed = LCD.screen.defaultRotateSpeed;
          LCD.screen.startRotate();
        },5000);

      },
      basic: function() {
        const lcd = LCD.screen.output;

        let count = 0;
        setTimeout(function() {
          lcd.clear();
          lcd.cursor(0,0).print(`counter1: ${parseInt(count)}`);
          lcd.cursor(1,0).print(`counter2: ${parseInt(++count)}`);
          lcd.cursor(2,0).print(`status: basic`);
          lcd.cursor(0,49);
        },1000);

        LCD.screen.activeInterval = setInterval(function() {
          // start screen rotation after 10s.


          lcd.cursor(0,10).print(`${parseInt(count)}`);
          lcd.cursor(1,10).print(`${parseInt(++count)}`);
          lcd.cursor(0,49);
          count++;
        }, 2000);

      },


      temperatures: function() {
        const lcd = LCD.screen.output;

          lcd.clear();
          lcd.useChar(10);
          lcd.useChar(11);
          lcd.useChar(12);
          // 1 column
          lcd.cursor(0,0).print(`1:${TH.outside.value.toFixed(1)}`);
          lcd.cursor(1,0).print(`2:${TH.beforeCHG.value.toFixed(1)}`);
          lcd.cursor(2,0).print(`3:${TH.betweenCHG_CX.value.toFixed(1)}`);
          lcd.cursor(3,0).print(`4:${TH.betweenCX_FAN.value.toFixed(1)}`);
          // 2 column
          lcd.cursor(0,7).print(`5:${TH.exhaust.value.toFixed(1)}`);
          lcd.cursor(1,7).print(`6:${TH.glygolIn.value.toFixed(1)}`);
          lcd.cursor(2,7).print(`7:${TH.glygolOut.value.toFixed(1)}`);
          lcd.cursor(3,7).print(`8:${TH.hotgas.value.toFixed(1)}`);
          // 3 column
          lcd.cursor(0,14).print(`9:${TH.fluidline.value.toFixed(1)}`);
          lcd.cursor(1,14).print(`:10::${TH.hxIn.value.toFixed(1)}`);
          lcd.cursor(2,14).print(`:11::${TH.hxOut.value.toFixed(1)}`);
          lcd.cursor(3,14).print(`:12::${TH.boilerUpper.value.toFixed(1)}`);
          lcd.cursor(0,49);

          LCD.screen.activeInterval = setInterval(function() {
            // 1 column
            lcd.cursor(0,2).print(`${TH.outside.value.toFixed(1)}`);
            lcd.cursor(1,2).print(`${TH.beforeCHG.value.toFixed(1)}`);
            lcd.cursor(2,2).print(`${TH.betweenCHG_CX.value.toFixed(1)}`);
            lcd.cursor(3,2).print(`${TH.betweenCX_FAN.value.toFixed(1)}`);
            // 2 column
            lcd.cursor(0,9).print(`${TH.exhaust.value.toFixed(1)}`);
            lcd.cursor(1,9).print(`${TH.glygolIn.value.toFixed(1)}`);
            lcd.cursor(2,9).print(`${TH.glygolOut.value.toFixed(1)}`);
            lcd.cursor(3,9).print(`${TH.hotgas.value.toFixed(1)}`);
            // 3 column
            lcd.cursor(0,16).print(`${TH.fluidline.value.toFixed(1)}`);
            lcd.cursor(1,16).print(`${TH.hxIn.value.toFixed(1)}`);
            lcd.cursor(2,16).print(`${TH.hxOut.value.toFixed(1)}`);
            lcd.cursor(3,16).print(`${TH.boilerUpper.value.toFixed(1)}`);
            lcd.cursor(0,49);
          },1000);


      },

      runningMan: function() {
        const lcd = LCD.screen.output;
        const frames = [":runninga:", ":runningb:"];
        let frame = 1, col = 0, row = 0;


        // These calls will store the "runninga" and "runningb"
        // characters in the LCD's built-in memory. The LCD
        // allows up to 8 custom characters to be pre-loaded
        // into memory.
        //
        // http://johnny-five.io/api/lcd/#predefined-characters
        //
        lcd.useChar("runninga");
        lcd.useChar("runningb");

        LCD.screen.activeInterval = setInterval(function() {
          lcd.clear().cursor(row, col).print(
            frames[frame ^= 1]
          );
          lcd.cursor(0,49);

          if (++col === lcd.cols) {
            col = 0;
            if (++row === lcd.rows) {
              row = 0;
            }
          }
        }, 400);
      },


    },
    startRotate: function () {
      this.rotateActive = true;

      switch(LCD.screen.nextScreen) {
        case "basic":
          this.nextRotateSpeed = 5*1000;
          LCD.screen.menus.basic();
          // next screen:
          LCD.screen.nextScreen = "temperatures";
          break;

        case "temperatures":
          this.nextRotateSpeed = 15*1000;
          LCD.screen.menus.temperatures();
          // next screen:
          LCD.screen.nextScreen = "runningMan";
          break;

        case "runningMan":
          this.nextRotateSpeed = 10*1000;
          LCD.screen.menus.runningMan();
          // next screen:
          LCD.screen.nextScreen = "basic";
          break;

      }

      this.rotateHandler = setInterval(function() {
        LCD.screen.restartRotate();
      },this.nextRotateSpeed || this.defaultRotateSpeed);

    },

    stopRotate: function() {
      this.rotateActive = false;
      clearInterval(this.rotateHandler);
      clearInterval(this.activeInterval);
    },

    restartRotate: function() {
      this.stopRotate();
      this.startRotate();
    }

  },



};

LCD.initial = board => genericInitial(LCD, 'LCD', board, function() {
  if(LCD.screen.active) LCD.screen.menus.starting();

});

export {LCD};
