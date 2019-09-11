import {
  Initialized,
} from './initialized.class';
import {genericInitial} from './func';

const initialized = new Initialized('AO');

const AO = {
  board: null,
  AO1: 'AO1',
};

AO.initial = board => genericInitial(AO, 'AO', board);



export {AO};
