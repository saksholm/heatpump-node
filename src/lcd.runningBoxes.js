import {LCD} from './lcd';

export const runningBoxes = () => {
  const lcd = LCD.screen.output;
  let col = 0, row = 0;

  LCD.screen.activeInterval = setInterval(function() {
    lcd.cursor(row,col).print(":sfbox:");
    // jump cursor for middle rows
    if([1,2].includes(row)) {
      if(col+1 === 1) col = 18;
    }

    if(++col === lcd.cols) {
      col = 0;
      if(row !== 3) {
        row++;
      } else {
        lcd.cursor(0,49);
      }

    }

  }, 200);
};
