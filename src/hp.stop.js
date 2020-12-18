import {HP} from './hp';
import {DO} from './do';
//import {TH} from './th';

import {
  calculateTimeout,
  mqttPublish,
  reportStopReason,
  freezeFrame,
  unixtimestamp,
} from './func';

import {
  stopToDefrostAndContinue,
  runDefrostCycle,
} from './logic.defrost';

import {GLOBALS} from "./globals";

const stopHpFan = () => {
  DO.hpFanOutput.shutdown(); // hp fan output to 0%
  console.log("hp fan output to 0%");

  DO.hpFan.set('off'); //output.off(); // Fan on
  console.log("hp fan off");
};

export const hpStop = function(reason, emergency=false, callback=false) {
  if(['stop','stopping', 'alarmA'].includes(HP.mode)) return false;

  if(HP.alarmA && HP.mode !== 'alarmA') {
    HP.mode = 'alarmA';
    if(HP.timeoutHandlers.startStep1 !== null) clearTimeout(HP.timeoutHandlers.startStep1);
    if(HP.timeoutHandlers.startStep2 !== null) clearTimeout(HP.timeoutHandlers.startStep2);
  }

  // TODO: report stop reason... normal/emergency/hotgas/abnormal/defrost/.....
  console.log(`STOP REASON :: ${reason}`);


  console.log("CALLING hpSTOP!!!!!!");
  if(!HP.alarmA) HP.mode = 'stopping';
  HP.allowedToRun = false;
  console.log("HP allowedToRun false");

  if(emergency) {
    HP.emergencyShutdown = true;

    console.log("\n**********************************************");
    console.log("**                                          **");
    console.log("**          EMERGENCY SHUTDOWN              **");
    console.log("**                                          **");
    console.log("**********************************************\n");

    HP.mqttStatus('emergency')
  }
//  const {wait} = HP.board;
  // let's check if minimumRunningTime is enough... if not.. we run it to end.
  // on emergency case we want to stop immediately.
  const calculatedTimeoutMillis = calculateTimeout(HP.actualRunStartTimestamp, HP.minimumRunningTime, true);
  console.log("STOPPING in...... calculatedTimeoutMillis", calculatedTimeoutMillis, "emergency: ", emergency);

  const timestamp = unixtimestamp();
  GLOBALS.lastRunTime = timestamp - HP.actualRunStartTimestamp;

  // publish lastRunTime
  mqttPublish(HP.board.mqttClient, 'hp/lastRunTime', GLOBALS.lastRunTime);

  const freezeFrameObj = freezeFrame();
  reportStopReason(reason,  freezeFrameObj);

  HP.timeoutHandlers.stopStep1 = setTimeout(() => {
    if(!HP.alarmA) HP.mode = 'stop';

    HP.restartTimestamp = timestamp;

    console.log("HP mode 'stop'");

    DO.hpOutput.shutdown(); // shutdown output
    console.log("hpOutput 0");
    DO.hpAllowed.set("off");
    console.log("hpAllowed output off");


    // wait 20s before shutting water pump, 2-way valve
    console.log("\nWaiting 20s before continuing\n");
    HP.timeoutHandlers.stopStep2 = setTimeout(() => {

      DO.damperConvection.set('open'); //output.on();
      console.log("damper convection open");
      DO.damperOutside.set('close'); //output.off();
      console.log("damper outside close");

      console.log("\nWait 60s more...\n");
      HP.timeoutHandlers.stopStep3 = setTimeout(() => {

        console.log("DEBUG ------------- GLOBALS.lastRunTime", GLOBALS.lastRunTime, "GLOBALS.afterDryLimit", GLOBALS.afterDryLimit );

        HP.defrost = true;
        console.log("HP.defrost = true");

        DO.hpFan.set('on');
        DO.hpFanOutput.set(GLOBALS.afterDryHpFanOutput);

        if(![
          'STOPPING_DEFROST',
          'MANUAL_DEFROST',
          'HOTGAS_DEFROST'
        ].includes(reason)) {
          if(GLOBALS.lastRunTime < GLOBALS.afterDryLimit) {
            console.log(`After dry activated, last run is too short (<${Math.floor(GLOBALS.afterDryLimit/60)})...  ${GLOBALS.lastRunTime} seconds (${Math.floor(GLOBALS.lastRunTime / 60)} mins)`);

            HP.defrost = true; // prevent things to start too early

            /*
            DISABLE THIS FOR A WHILE AND TEST ANOTHER DEFROST METHOD


            HP.timeoutHandlers.afterDry = setTimeout(() => {
              console.log("stopping afterDry 1");
              stopHpFan();
              HP.defrost = false;
              console.log("HP.defrost = false");
              clearTimeout(HP.timeoutHandlers.afterDry);
              HP.timeoutHandlers.afterDry = null;

            }, GLOBALS.afterDryTime * 1000);

             */
          } else {
            console.log(`After dry not activated, last run was ${GLOBALS.lastRunTime} seconds (${Math.floor(GLOBALS.lastRunTime / 60)} mins)`);
            HP.timeoutHandlers.afterDry = setTimeout(() => {
              console.log("stopping afterDry 2");
              stopHpFan();
              HP.defrost = false;
              console.log("HP.defrost = false");
              clearTimeout(HP.timeoutHandlers.afterDry);
              HP.timeoutHandlers.afterDry = null;
            }, GLOBALS.afterDryTimeShort * 1000);
          }
        }


        if(HP.defrost && reason !== 'MANUAL_DEFROST') {
          runDefrostCycle();
        } else {
          DO.waterpumpCharging.set('off'); // waterpump charging relay to on
          console.log("waterpump charging output off()");
          DO.load2Way.shutdown(); // let's open 2way valve 0%
          console.log("load 2-way to 0%");

          // turn pid controller target to 0
          DO.load2Way.setTarget(0);
          DO.load2Way.controller.setTarget(0);
          console.log("load 2-way pid controller to 0");
        }



        if(HP.emergencyShutdown) {
          console.log("\nStopped whole process\n");
          console.info("To run process again please type: 'emergencyReset()'");
        }

        clearTimeout(HP.timeoutHandlers.stopStep1);
        clearTimeout(HP.timeoutHandlers.stopStep2);
        clearTimeout(HP.timeoutHandlers.stopStep3);

        if(callback && typeof callback === 'function') callback();

      },60000);

    },20000);

  }, emergency ? 0 : calculatedTimeoutMillis);

};
