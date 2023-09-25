import {DO} from "./do";
import {HP} from "./hp";
import {calculateDynamicHPOutput} from "./func";
import {GLOBALS} from "./globals";

export const dynamicHpOutputMax = () => {
  if(DO.hpAllowed.value === 'on') {
    if(HP.dynamicHPOutput) {
      const getDynamicHPOutput = calculateDynamicHPOutput();
      // set new if we are below max default
      if(getDynamicHPOutput < DO.hpOutput.maxValueDefault) {
        DO.hpOutput.maxValue = getDynamicHPOutput;
        if(GLOBALS.debugLevels.dynamicHPOutput) console.log("DEBUG::HP.loop::dynamicHPOutput dynamicValue", getDynamicHPOutput, "maxValue", DO.hpOutput.maxValue, "maxDefault", DO.hpOutput.maxValueDefault, new Date().toISOString());
      }
    } else {
      // set to default
      if(DO.hpOutput.maxValue < DO.hpOutput.maxValueDefault) DO.hpOutput.maxValue = DO.hpOutput.maxValueDefault;
    }
  }

};
