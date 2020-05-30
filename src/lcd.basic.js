import {LCD} from './lcd';
import {HP} from './hp';
import {DO} from './do';
import {GLOBALS} from './globals';

export const lcdBasic = () => {

  const lcd = LCD.screen.output;

  let count = 0;
//  setTimeout(function() {
    lcd.clear();
    lcd.cursor(0,0).print(`Status: ${GLOBALS.status}`);
    lcd.cursor(1,0).print(`HP Mode: ${HP.mode}`);

    lcd.cursor(2,0).print(`HP%:`);
    lcd.cursor(2,6).print(`${DO.hpOutput.value.toString().padStart(3, " ")}`);

    lcd.cursor(3,0).print(`FAN%:`);
    lcd.cursor(3,6).print(`${DO.hpFanOutput.value.toString().padStart(3, " ")}`);

    lcd.cursor(2,10).print(`2Way%:`);
    lcd.cursor(2,17).print(`${DO.load2Way.value.toString().padStart(3, " ")}`);

    lcd.cursor(3,10).print(`AHU%:`);
    lcd.cursor(3,17).print(`${DO.ahuFanOutput.value.toString().padStart(3, " ")}`);
    lcd.cursor(0,49);
//  },1000);

  LCD.screen.activeInterval = setInterval(function() {
    lcd.cursor(0,8).print(`${GLOBALS.status.padEnd(11, " ")}`);
    lcd.cursor(1,9).print(`${HP.mode.padEnd(11," ")}`);

    lcd.cursor(2,6).print(`${DO.hpOutput.value.toString().padStart(3, " ")}`);
    lcd.cursor(3,6).print(`${DO.hpFanOutput.value.toString().padStart(3, " ")}`);
    lcd.cursor(2,17).print(`${DO.load2Way.value.toString().padStart(3, " ")}`);
    lcd.cursor(3,17).print(`${DO.ahuFanOutput.value.toString().padStart(3, " ")}`)

    lcd.cursor(0,49);
    count++;
  }, 2000);

};
