import {HP} from './hp';

export const logicAlarms = () => {
  if(HP.alarmA) {
    if(![
      'stop',
      'stopping',
      'alarmA',
    ].includes(HP.mode)) {
      // emergency stopping hp
      console.log(`HP Alarm A :: ...is active with reason: ${HP.alarmAReason}`);
      HP.stop(true);
    }

    return false;
  }
};
