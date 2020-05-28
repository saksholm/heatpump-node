import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';

import {
  calculateTimeout,
  unixtimestamp,
} from './func';

export const hpStop = function(emergency=false) {
  if(emergency) {
    HP.emergencyShutdown = true;
    HP.restartTimestamp = unixtimestamp();
    console.log("\n**********************************************");
    console.log("**                                          **");
    console.log("**          EMERGENCY SHUTDOWN              **");
    console.log("**                                          **");
    console.log("**********************************************\n");

    HP.mqttStatus('emergency')
  }
  const {wait} = HP.board;
  // let's check if minimumRunningTime is enough... if not.. we run it to end.
  // on emergency case we want to stop immediately.
  wait(emergency ? 0 : calculateTimeout(HP.actualRunStartTimestamp, HP.minimumRunningTime, true), () => {
    HP.mode = 'stop';
    console.log("HP mode 'stop'");
    HP.allowedToRun = false;
    console.log("HP allowedToRun false");

    DO.hpOutput.set(0); // shutdown output
    console.log("hpOutput 0");
    DO.hpAllowed.set("off");
    console.log("hpAllowed output off");


    // wait 20s before shutting water pump, 2-way valve
    console.log("\nWaiting 20s before continuing\n");
    wait(20000,() => {
      DO.waterpumpCharging.output.off(); // waterpump charging relay to on
      console.log("waterpump charging output off()");
      DO.load2Way.set(0); // let's open 2way valve 0%
      console.log("load 2-way to 0%");

      // turn pid controller target to 0
      DO.load2Way.controller.setTarget(0);
      console.log("load 2-way pid controller to 0");

      // wait 10s more before closing hp fan and close outside damper
      // and open convection damper
      console.log("\nWait 10s more...\n");
      wait(10000, () => {
        DO.hpFanOutput.set(0); // hp fan output to 0%
        console.log("hp fan output to 0%");

        DO.hpFan.output.off(); // Fan on
        console.log("hp fan output off()");

        DO.damperConvection.output.on();
        console.log("damper convection output on()");
        DO.damperOutside.output.off();
        console.log("damper outside output off()");


        console.log("\nStopped whole process\n");
        console.info("To run process again please type: 'emergencyReset()'");
      });

    });
  });

};
