import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {GLOBALS} from "./globals";

export const logicLoad2WayController = () => {
  if(![
    'stop',
    'manual',
    'emergencyStop',
  ].includes(HP.mode)) {
    // update temperature to controller and get new value out
    const controllerUpdate = DO.load2Way.controller.update(TH.hxOut.value);
    const controllerUpdateRounded = Math.round(controllerUpdate);
    const newValue = controllerUpdateRounded;
    GLOBALS.debugLevels.load2WayControllerPid && console.log(`logicLoad2WayController() pid controllerUpdate: ${controllerUpdate} (${newValue}), hxOut.value: ${TH.hxOut.value}`);

    // if new value is not the existing value.. we update

    console.log("DEBUG logic.load2way: ", HP.running, DO.load2Way.maxValueOnRunning, DO.load2Way.value);

    if(newValue !== DO.load2Way.value && newValue <= DO.load2Way.maxValueOnRunning) {
      DO.load2Way.set(newValue);
    }
  }
};
