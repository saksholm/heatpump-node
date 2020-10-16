import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';

export const logicLoad2WayController = () => {
  if(![
    'stop',
    'manual',
  ].includes(HP.mode)) {
    // update temperature to controller and get new value out
    const controllerUpdate = DO.load2Way.controller.update(TH.hxOut.value);
    console.log(`logicLoad2WayController() controllerUpdate: ${controllerUpdate}, hxOut.value: ${TH.hxOut.value}`);

    const newValue = Math.round(controllerUpdate);
    // if new value is not the existing value.. we update
    if(newValue !== DO.load2Way.value) {
      DO.load2Way.set(newValue);
    }
  }
};
