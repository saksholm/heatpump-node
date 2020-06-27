import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {GLOBALS} from './globals';
import {
  unixtimestamp,
} from './func';

import {hotgasWatch} from './hp.hotgasWatch';
import {hpCoolingLoop} from './hp.cooling';
import {hpHeatingLoop} from './hp.heating';
import {hpWaterHeating} from './hp.waterHeating';

const {
  deadZone,
} = GLOBALS;


export const hpLoop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {

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

    const timestamp = unixtimestamp();

    hotgasWatch();

    // some operator to handle if this should be active or not
    // input is pure output...
    if(GLOBALS.dryRun || (HP.heatToWater && DO.load2Way.value !== 0)) {

      // TBD: this switch is just a mock.. depend on HP.mode what to do
      switch(HP.mode) {
        case "cooling":
          // call cooling func
          hpCoolingLoop();
          break;
        case "heating":
          hpHeatingLoop();
          break;
        case "waterHeating":
          hpWaterHeating();
          break;
      }


        if(![
          'stop',
          'manual',
        ].includes(HP.mode)) {
          // update temperature to controller and get new value out
          const newValue = Math.round( DO.load2Way.controller.update(TH.hxOut.value) );
          // if new value is not the existing value.. we update
          if(newValue !== DO.load2Way.value) {
            DO.load2Way.set(newValue);
          }
        }


        // we are above maximum hxIn... we should now stop things
        if(
          (TH.hxIn.value + deadZone) >= HP.hxInMaximum &&
          ![
            'stop',
            'starting',
            'manual',
          ].includes(HP.mode)
        ) {
          console.log(`HP.loop :: hxIn + deadZone >= hxInMaximum... STOP HP, HP.mode = ${HP.mode}`);
          HP.stop();
        }


        // old enough to make new checks
        if(timestamp > (HP.outputWatchInterval + HP.nextLoopIntervalTimestamps.output) ) {

          if(DO.load2Way.value >= 85 && DO.load2Way.value < 95) {
            // lower hp output by 10%... if not already minValue
            if(
              DO.hpOutput.value !== DO.hpOutput.minValue &&
              ![
                'stop',
                'manual',
              ].includes(HP.mode)
            ) {
              DO.hpOutput.decrease(5);
              console.log(`HP.loop :: decreasing hpOutput (to ${DO.hpOutput.value}) by 5% because load2Way (${DO.load2Way.value}) is more than 85% open, HP.mode = ${HP.mode}`);
            }

          } else if(DO.load2Way.value >= 95) {
            // if hpOutput is already on minimum value we can stop things now?
            if(DO.hpOutput.value === DO.hpOutput.minValue) {

              // call only if not stop/stopping/starting
              if(![
                  'stop',
                  'stopping',
                  'starting',
              ].includes(HP.mode)) {
                console.log(`HP.loop :: STOPPING HP, because load2Way (${DO.load2Way.value}) is more than 90% open and hpOutput is minimum, HP.mode = ${HP.mode}`);
                HP.stop();
              }
            }
          }

          // do not allow
          if(![
            'stop',
            'stopping',
            'starting',
            'manual',
          ].includes(HP.mode)) {
            // if load2Way is <65 and hpOutput is not maxValue
            if(DO.load2Way.value < 65 && DO.hpOutput.value < DO.hpOutput.maxValue) {
              DO.hpOutput.increase(1);
              console.log(`HP.loop :: increasing hpOutput (to ${DO.hpOutput.value}) by 1% because load2Way (${DO.load2Way.value}) is less than 65%, HP.mode = ${HP.mode}`);
            }
          }
          HP.nextLoopIntervalTimestamps.output = timestamp;
        }



        if(timestamp > (HP.fanWatchInterval + HP.nextLoopIntervalTimestamps.fan)) {

          // prevent hpFanOutput increasing when HP.mode = stop/starting/stopping
          if(![
            'stop',
            'starting',
            'stopping',
            'manual',
          ].includes(HP.mode)) {
            DO.hpFanOutput.increase(1);
            console.log(`HP.loop :: increasing hpFanOutput (to ${DO.hpFanOutput.value}) by 1%, HP.mode = ${HP.mode}`);
          }



          HP.nextLoopIntervalTimestamps.fan = timestamp;
        }


    }

  });
};
