import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';

import {GLOBALS} from './globals';
import {TH} from './th';
//import {HP} from './hp';
//import {DO} from './do';

import {
  genericInitial,
  createLCDDataScreen,
  lcdNextScreenHelper,
} from './func';

import {runningBoxes} from './lcd.runningBoxes';
import {lcdBasic} from './lcd.basic';

const initialized = new Initialized('LCD');

const LCD = {
  board: null,
  screen: {
    name: 'LCD Screen',
    type: 'lcd2004',
    rotateActive: false,
    autoReset: 30*60*1000,
    defaultRotateSpeed: 5*1000, // 5s.
    nextRotateSpeed: null,
    rotateHandler: null,
    activeInterval: null,
    currentInstance: null,
    nextScreen: "runningBoxes",
    stickyScreen: "basic",
    stickyScreenTime: 5*60*1000, // 5mins
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

      initialized.done(this.name);
    },
    menus: {
      startupScreen: function() {
        const lcd = LCD.screen.output;
        lcd.useChar(10);
        lcd.useChar(11);
        lcd.useChar(12);
        lcd.useChar("sfbox");

        console.log("starting.... lcd");
        lcd.clear();
        lcd.cursor(0,0).print("####################");
        lcd.cursor(1,0).print("#  HP Controller   #");
        lcd.cursor(2,0).print(`#  v.${GLOBALS.version.padEnd(14, " ")}#`);
        lcd.cursor(3,0).print("####################");
        lcd.cursor(0,49);



        setTimeout(() => {
          LCD.screen.nextRotateSpeed = LCD.screen.defaultRotateSpeed;
          LCD.screen.startRotate();
        },1000);

      },
      runningBoxes: () => runningBoxes(),
      basic: () => lcdBasic(),
      temperatures1: () => {

        const displayElements = [
          {element: TH.outside},
          {element: TH.beforeCHG},
          {element: TH.betweenCHG_CX},
          {element: TH.betweenCX_FAN}
        ];

        createLCDDataScreen(displayElements);
      },


      temperatures2: () => {
        const displayElements = [
          {element: TH.exhaust},
          {element: TH.glygolIn},
          {element: TH.glygolOut},
          {element: TH.hotgas}
        ];

        createLCDDataScreen(displayElements);
      },


    }, // end of menus object

    startRotate: function () {
      this.rotateActive = true;

      // screen instances...
      const {
        basic,
        temperatures1,
        temperatures2,
        runningBoxes,
      } = LCD.screen.menus;

      switch(LCD.screen.nextScreen) {
        case "basic":
          lcdNextScreenHelper("basic",basic,"temperatures1");
          break;
        case "temperatures1":
          lcdNextScreenHelper("temperatures1", temperatures1, "temperatures2");
          break;
        case "temperatures2":
          lcdNextScreenHelper("temperatures2", temperatures2, "basic");
          break;
        case "runningBoxes":
          lcdNextScreenHelper("runningBoxes",runningBoxes, "temperatures1", 10*1000);
          break;
      }

      this.rotateHandler = setInterval(function() {
        LCD.screen.restartRotate();
      }, this.nextRotateSpeed || this.defaultRotateSpeed);

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
  if(LCD.screen.active) LCD.screen.menus.startupScreen();

});

export {LCD};
