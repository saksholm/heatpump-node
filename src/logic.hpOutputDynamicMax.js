import {DO} from "./do";
import {HP} from "./hp";
import {calculateDynamicHPOutput, mqttPublish} from "./func";
import {GLOBALS} from "./globals";

export const dynamicHpOutputMax = () => {
  if(DO.hpAllowed.value === 'on') {
    if(HP.dynamicHPOutput) {
      const getDynamicHPOutput = calculateDynamicHPOutput();
      // set new if we are below max default
      if(getDynamicHPOutput < DO.hpOutput.maxValueDefault) {
        DO.hpOutput.maxValue = getDynamicHPOutput;

        // find topic by name and publish
        const topic = DO.hpOutput.mqttExtraStates.find(x => x.name === 'hpOutputMaxValue').topic;
        mqttPublish(DO.board.mqttClient, topic, DO.hpOutput.maxValue);

        if(GLOBALS.debugLevels.dynamicHPOutput) console.log("DEBUG::HP.loop::dynamicHPOutput dynamicValue", getDynamicHPOutput, "maxValue", DO.hpOutput.maxValue, "maxDefault", DO.hpOutput.maxValueDefault, new Date().toISOString());
      }
    } else {
      // set to default
      if(DO.hpOutput.maxValue < DO.hpOutput.maxValueDefault) DO.hpOutput.maxValue = DO.hpOutput.maxValueDefault;
    }
  }

};
