import five from 'johnny-five';
import getUnixTime from 'date-fns/getUnixTime';
import Controller from 'node-pid-controller';
import {GLOBALS} from './globals';
import {DO} from './do';
//import {DI} from './di';
//import {AO} from './ao';
//import {AI} from './ai';
import {TH} from './th';
import {HP} from './hp';
import {LCD} from './lcd';
import {AI} from "./ai";

const {
  map,
  constrain,
//  sum,
} = five.Fn;

export const parseMQTTString = path => {
  return `${GLOBALS.mqttBase}${path}`;
};

export const unixtimestamp = (datetime=null, microtime=false) => {
  if(!datetime) datetime = new Date();
  if(microtime) return getUnixTime(datetime * 1000);
  return getUnixTime(datetime);
};

export const calculateTimeout = (timestamp, delay, milliseconds=false) => {
  let timeout;

  if( timestamp === 0) timeout = 0;
  if(timestamp !== 0) {
    const currentTimestamp = unixtimestamp();
    if( timestamp + delay <= currentTimestamp )  timeout = 0;
    if( currentTimestamp - timestamp <= delay )  timeout = (timestamp + delay) - currentTimestamp;
  }
  if(milliseconds) return timeout * 1000;
  return timeout;
};

export const mapPercentToPWM = (value,min=false,max=false) => {
  value = parseInt(value);
  // moved these to defaultForSet check
//  if(min && value < min) console.warn(`value (${value}) is under minimum (${min})`);
//  if(max && value > max) console.warn(`value (${value}) is over maximum (${max})`);
  value = constrain(value, (min ? min : 0), (max ? max : 100));
  return map(value, 0,100, 0,255);
};

export const genericInitial = (module, name, board, callback=null) => {
  if(module.board === null) {
    module.board = board;
  }

  let ds18b20delayCount = 1;

  Object.keys(module).map(key => {
    const instance = module[key];

    if(
      key !== "board" &&
      instance !== null &&
      instance &&
      instance.active
    ) {
      if(typeof instance.initial === "function") {

        let delay = 0;
        if(instance.type === 'DS18B20') {
          delay = 100*ds18b20delayCount;
          ds18b20delayCount = ds18b20delayCount + 1;
          setTimeout(() => instance.initial(), delay);
        } else {
          instance.initial();
        }

        const check = !!instance.pin && GLOBALS.activePins.find(x => x.pin === instance.pin);

        if(check) { console.log("\n\n\n\n\n\n\nPIN IS ALREADY IN USE!!!!!", instance.pin, "\n\n\n\n\n\n\n\n\n\n"); }
        const obj = {
          module: name,
          name: instance.name,
          pin: instance.pin,
          type: instance.type,
        };
        if(instance.address) obj.address = instance.address;
        GLOBALS.activePins.push(obj);
      }
      if(typeof instance.repl === "object") {
//        board.repl.inject(instance.repl);
        try {
          injectRepls(module,key);

        } catch(e) {
          console.err("genericInitial catch on repls inject",e);
        }
      }
      if(instance?.mqttState?.length > 0) {
        mqttPublish(module.board.mqttClient, instance.mqttState, instance.value);
      }
    }
  });
  console.log(`\n${name} initial setup`.padEnd(41,"."), `DONE\n`);
  if(callback) callback();
};

export const injectRepls = (module, key) => {

  setTimeout(() => {
    console.log(`injecting repl's from ${key}`);
    const repl = module[key].repl;

    module.board.repl.inject(repl);
  },200);
};


export const mqttSubscriptions = mqttClient => {
  Object.keys(DO).map(key => {
    const instance = DO[key];

    if(key !== "board" && instance !== null && instance ) {
      if(typeof instance.mqttCommand === "string" && instance.mqttCommand !== "") {

        mqttSubscribe(mqttClient, instance.mqttCommand);
/*
        mqttClient.subscribe(`cmnd/${GLOBALS.mqttBase}/${instance.mqttCommand}`, (err) => {
          if(err) console.warn(`error in mqttSubscriptions, (${instance.mqttCommand}).. ${err}`);
          console.log(`Subscribed topic: ${instance.mqttCommand} ...`);
        });
*/
      }
    }
  });
};

export const mqttSubscribe = (mqttClient, mqttTopic) => {
  mqttClient.subscribe(`cmnd/${GLOBALS.mqttBase}/${mqttTopic}`, (err) => {
    if(err) console.warn(`error in mqttSubscriptions, (${mqttTopic}).. ${err}`);
    console.log(`Subscribed topic: ${mqttTopic} ...`);
  });
};

export const mqttPublish = (mqttClient,topic,value) => {
  const t = `state/${GLOBALS.mqttBase}/${topic}`;
  const v = typeof value !== "string" ? value.toString() : value;
  mqttClient.publish(t,v, (err) => {
    if(err) console.log(`mqttPublish (${t}) error: ${err}`);
  });
};

export const mqttCommandTopics = () => {
  const arr = [];

  Object.keys(DO).map(key => {
    const instance = DO[key];
    if(key !== "board" && instance !== null && instance.mqttCommand) {
      if(typeof instance.mqttCommand === "string" && !!instance.mqttCommand) {

        const topic = `cmnd/${GLOBALS.mqttBase}/${instance.mqttCommand}`;

        switch(instance.type) {
          case 'pwm':
            arr.push({
              topic: topic,
              set: value => instance.set(value),
            });
            break;
          case 'relay':
            arr.push({
              topic: topic,
              set: value => instance.set(value),
            });
            break;
          default:
            console.warn("mqttCommandTopics, type not defined", instance.type);
        }

      }
    }

  });


  GLOBALS.mqttCommandSubscribes.map(obj => {
    const topic = `cmnd/${GLOBALS.mqttBase}/${obj.topic}`;

    switch (obj.type) {
      case 'func':
        arr.push({
          topic: topic,
          set: value => obj.func(value),
        });
        break;
      default:
        console.warn("mqttCommandTopics, type not defined", obj.type);
    }
  });



  return arr;
};

export const mqttOnMessage = (mqttClient,topic,message) => {
  const {commandTopics} = mqttClient;
  console.log(commandTopics);
  commandTopics.filter(x => x.topic === topic).map(obj => {
    console.log(`Got message, topic: ${obj.topic}, msg buffer: ${message}, message str: ${message.toString()}, message type: ${typeof message}`);
    obj.set(message.toString());
  });
};

export const convertStringToBoolean = str => {
  str = str.toLowerCase();
  if(str === "true") return true;
  if(str === "false") return false;
  return str;
};

export const relayOnOff = instance => {
  switch (instance.value) {
    case true:
    case "on":
      instance.output.open(); // on
      break;
    case false:
    case "off":
      instance.output.close(); // close
      break;
  }
};

export const pidController = (p=0.25,i=0.01,d=0.01,time=1) => {
  return new Controller(p,i,d,time);
};

export const round2Decimals = value => {
  return Math.round(value * 100) / 100;
};


export const calculateThermistorValue = (raw, {beta, roomTemp, balanceResistor, resistorRoomTemp, maxAdc}) => {
  // (c) original idea is from: https://www.allaboutcircuits.com/projects/measuring-temperature-with-an-ntc-thermistor/

  const rThermistor = balanceResistor * ( (maxAdc / raw) - 1);
  const tKelvin = (beta * roomTemp) / (beta + (roomTemp * Math.log(rThermistor / resistorRoomTemp)));
  const tCelsius = tKelvin - 273.15;  // convert kelvin to celsius

  if(GLOBALS.debug) {
    console.log("calculateThermistorValue called raw:", raw);
    console.log("rThermistor", rThermistor);
    console.log("tKelvin", tKelvin);
    console.log("tCelsius", tCelsius);
  }

  return tCelsius;

};

export const defaultForSet = (instance,value) => {
//  console.log("defaultForSet in: ", value, instance.name);
  if(!instance.active) { console.warn(`name: ${instance.name}, type: ${instance.type} not active!`); return false; }
  if(instance.enum) {
    if(typeof value === 'undefined' || !instance.enum?.includes(value)) {
      GLOBALS.debug && console.warn(`${instance.name} set value not match enum.. enum: ${instance.enum}, value: ${value}`);
      console.warn("Now failing defaultForSet... NAME:", instance.name, "and value is: ", value, "and enums are: ", instance.enum);
      return false;
    }
  }

  if(instance.minValue) {
    if(value < instance.minValue) console.warn(`value (${value}) is under minimum (${instance.minValue})`);
  }
  if(instance.maxValue) {
    if(value > instance.maxValue) console.warn(`value (${value}) is over maximum (${instance.maxValue})`);
  }

  return true;
};

export const validateTemperatures = value => {
  if(parseInt(value) > 120) return false;
  if(parseInt(value) < -40) return false;
  return value;
};

export const checkThreshold = (value, instance) => {
  if(value > instance.value) {
    if(value - instance.value >= (instance.threshold || TH.threshold) ) return true;
  }
  if(value < instance.value) {
    if(instance.value - value >= (instance.threshold || TH.threshold) ) return true;
  }

  return false;
};

export const setupDS18B20 = instance => {
  return new five.Thermometer({
    controller: "DS18B20",
    pin: instance.pin,
    freq: instance.interval || TH.interval,
    address: instance.address || undefined,
  });
};

export const setupI2C_DS18B20 = (instance=false, board=false) => {
  if(instance && board) {
    const {
      interval,
      name,
//      i2c,
      objectName,
    } = instance;

    if(objectName) {

      const {
        loop,
      } = board;

      // register handle?!?
      GLOBALS.timersTH[objectName] = {changeIntervalMax: 0};
      GLOBALS.timersTH[objectName] = {changeIntervalMaxTimes: 0};

      loop(interval || TH.interval, () => {
        const timestamp = unixtimestamp();
        const {
          value,
          i2cReadTimestamp,
//          valueChangedTimestamp,
//          valueChangedTimestampAgo,
        } = TH.thI2CReads[objectName];

        if(value !== null && instance.value !== value) {
          if(validateTemperatures(value)) {
            // validated temperature... save it
            if(checkThreshold(value,instance)) {
              if(GLOBALS.printTH) console.log(`${name.padEnd(40, ".")} - temperature read AND over threshold!`, value);
              instance.set(round2Decimals(value));
            } else {
              if(GLOBALS.printTH) console.log(`${name.padEnd(40, ".")} - temperature read`, value);
            }


          }
        }

        // check if instance.i2c.lastRead is too old compared to interval..
        // so we can know if slave card/sensor is alive
        // TODO: hand error over to mqtt?

        if(GLOBALS.debug && !!i2cReadTimestamp && (i2cReadTimestamp + (interval*2) < timestamp)) {
         console.warn(`${name} is not readed from I2C address for a while (>${interval*2} seconds) ... x2 interval cycle.\nPlease check what's going on!`);
        }

      });

      changeIntervalMaxTimeout(GLOBALS.timersTH[objectName].changeIntervalMax, instance);
      changeIntervalMaxTimesTimeout(GLOBALS.timersTH[objectName].changeIntervalMaxTimes, instance);

    } else {
      console.error(`ERROR: ${name} not contains objectName property!`);
    }
  } else {
    if(!instance) console.error(`ERROR in setupI2C_DS18B20(), instance missing`);
    if(!board) console.error(`ERROR in setupI2C_DS18B20(), board missing`, instance?.name ? instance.name : '');
  }

};

const changeIntervalMaxTimeout = (timer, instance) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const {
      value,
      objectName
    } = instance;
    instance.set(value); // re sending same value...
    // manipulate changes object
    TH.thI2CReads[objectName].valueChangedTimestamp = unixtimestamp();
    TH.thI2CReads[objectName].valueChangedTimestampAgo = 0;

    // call another timer routine to reset:
    changeIntervalMaxTimesTimeout(GLOBALS.timersTH[objectName].changeIntervalMaxTimes, instance);
  }, TH.changeIntervalMax);
};

const changeIntervalMaxTimesTimeout = (timer, instance) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const {
      value,
      objectName
    } = instance;
    instance.set(value); // re sending same value...
    // manipulate changes object
    TH.thI2CReads[objectName].valueChangedTimestamp = unixtimestamp();
    TH.thI2CReads[objectName].valueChangedTimestampAgo = 0;

    // call another timer routine to reset:
    changeIntervalMaxTimeout(GLOBALS.timersTH[objectName].changeIntervalMax, instance);
  }, TH.changeIntervalMax);
};

/*
const readI2CDS18B20 = (instance, board) => {
  const {name, i2c, interval} = instance;
  const {address, register, bytes, lastRead, scale} = i2c;
  board.i2cReadOnce(address, register, bytes, function(b) {
    console.log("I2C READ");
    const {value, i2cReadTimestamp} = handleI2C_TH_Data(b, {}, scale, true);
    if(value !== instance?.value && value !== null) {
     if(validateTemperatures(value)) {
       // validated temperature... save it
       instance.set(round2Decimals(value));
       i2c.lastRead = i2cReadTimestamp;

       if(GLOBALS.printTH) console.log(`${name.padEnd(40, ".")} - temperature read`, value, lastRead, b);
     }
    }

    // check if instance.i2c.lastRead is too old compared to interval..
    // so we can know if slave card/sensor is alive
    // TODO: hand error over to mqtt?

    if(GLOBALS.debug && !!lastRead && (lastRead + (interval*2) < i2cReadTimestamp)) {
     console.warn(`${name} is not readed from I2C address #${address}, register #{register} for >${interval*2} seconds (x2 interval cycle).\nPlease check what's going on!`);
    }
  });
};

*/
export const increaseValue = (instance, step=1) => {
  let newValue = instance.value+step;
  //console.log(`increaseValue(), instance: ${instance.name}, newValue: ${newValue}`);
  if(newValue > instance.maxValue) newValue = instance.maxValue;
  if(newValue < instance.minValue) newValue = instance.minValue;
  instance.set(newValue);
};

export const decreaseValue = (instance,step=1) => {
  let newValue = instance.value - step;
  if(newValue < instance.minValue) newValue = instance.minValue;
  if(newValue > instance.maxValue) newValue = instance.maxValue;
  instance.set(newValue);
};

export const valueToOnOff = instance => {

//  console.log("whaat is this", instance.name, instance);
  // TODO: handle instance.enum
  if(instance.output !== null) {
    if(instance.value === "on") instance.output?.open(); // on
    if(instance.value === "off") instance.output?.close(); // off
    if(instance.value === true) instance.output?.open(); // on
    if(instance.value === false) instance.output?.close(); // off
    if(instance.value === "open") instance.output?.open();
    if(instance.value === "close") instance.output?.close();
  }
};



export const handleI2C_TH_Data = (bytes,thObj={},scale=100, ret=false) => {
  let bytePairs = [];
  let thCount = 1;
  const timestamp = unixtimestamp();

  for(let i=0, length=bytes.length; i<length; i++) {
    const byte = bytes[i];
    if(bytePairs.length <= 2) {
      bytePairs.push(byte);
    }
    if(bytePairs.length === 2) {
      const buf = Buffer.from(bytePairs);
      const int = buf.readInt16BE(0);
      const th = int/scale;
      const thKey = `th${thCount}`;

      const obj = {
        value: th !== -327.68 ? th : null,
        i2cReadTimestamp: timestamp,
      };

      if(ret) return obj;

      // value is changed...
      if(thObj[thKey]?.value !== th) {
        thObj[thKey] = {
          ...obj,
          valueChangedTimestamp: timestamp,
          valueChangedTimestampAgo: 0,
        };

        GLOBALS.debugLevels.th && printChangedTHValues(thObj[thKey], thKey);
      } else {
        thObj[thKey] = {
          ...thObj[thKey],
          i2cReadTimestamp: timestamp,
          valueChangedTimestampAgo: (timestamp - thObj[thKey]?.valueChangedTimestamp),
        };
      }

      thCount++;
      bytePairs = [];
    }
  }
}

export const createLCDDataScreen = displayElements => {
  if(displayElements?.length > 0) {
    const lcd = LCD.screen.output;
    lcd.clear();

//    let count = 1;
    displayElements.map((obj,idx) => {
      const {name,lcdName, value} = obj.element;
      const displayName = lcdName || 'xxxx';
      if(lcdName === undefined) console.warn(`Missing lcdName instance in '${name}'`);
      lcd.cursor(idx,0).print(`${displayName.padEnd(15," ")} ${value.toFixed(1)}`);
    });
    lcd.cursor(0,49);

    LCD.screen.activeInterval = setInterval(function() {
      displayElements.map((obj,idx) => {
        const {
//          name,
//          lcdName,
          value,
        } = obj.element;
        lcd.cursor(idx,15).print(`${value.toFixed(1).padStart(5," ")}`);
      });
      lcd.cursor(0,49);
    },1500);
  }
}

export const setStatus = status => {
  GLOBALS.status = status;
  // TODO: mqtt update
};

export const lcdNextScreenHelper = (instanceName, instance, nextScreen, nextRotateSpeed=LCD.screen.defaultRotateSpeed) => {
  LCD.screen.nextRotateSpeed = LCD.screen.stickyScreen === instanceName ? LCD.screen.stickyScreenTime : nextRotateSpeed;
  LCD.screen.nextScreen = nextScreen || "basic";
  LCD.screen.currentInstance = instance;
  instance();
};

export const initializePidController = (instance,callback) => {
  if(!isPidControllerActive(instance)) {
    const {
      controller_p,
      controller_i,
      controller_d,
      controller_time,
    } = instance;
//    instance.controller = pidController(controller_p, controller_i, controller_d, controller_time);
    instance.controller = pidController(controller_p, controller_i, controller_d);

    if(isFunction(callback)) callback();
  }
};

export const isPidControllerActive = instance => {
  return !!instance?.controller;
};

export const isFunction = instance => {
  return typeof instance === 'function';
};

export const freezeFrame = () => {
  const thArray = [
    'outside',
    'beforeCHG',
    'betweenCHG_CX',
    'betweenCX_FAN',
    'exhaust',
    'glygolIn',
    'glygolOut',
    'hotgas',
    'ahuCirculationSupply',
    'hxIn',
    'hxOut',
    'boilerUpper',
    'boilerMiddle',
    'boilerLower'
  ];

  const obj = {
    temperatures: {},
    globals: {
      startupTimestamp: GLOBALS.startupTimestamp,
      lastRunTime: GLOBALS.lastRunTime,
      lastRunTimeMinutes: Math.floor(GLOBALS.lastRunTime / 60),
      boilerUpperDemand: GLOBALS.boiler.upper.demand,
      boilerUpperRequest: GLOBALS.boiler.upper.request,
      boilerMiddleDemand: GLOBALS.boiler.upper.demand,
      boilerMiddleRequest: GLOBALS.boiler.middle.request,
      boilerLowerDemand: GLOBALS.boiler.lower.demand,
      boilerLowerRequest: GLOBALS.boiler.lower.request,
    },
    hp: {
      error: HP.error,
      program: HP.program,
      mode: HP.mode,
      alarmA: HP.alarmA,
      alarmAReason: HP.alarmAReason,
      alarmB: HP.alarmB,
      alarmBReason: HP.alarmBReason,
      lastStopTime: HP.lastStopTime,
      actualRunStartTimestamp: HP.actualRunStartTimestamp,
      restartTimestamp: HP.restartTimestamp,
      defrost: HP.defrost,
      coolingDemand: HP.coolingDemand,
      emergencyShutdown: HP.emergencyShutdown,
    },

  };

  thArray.map(thName => {
    obj.temperatures[thName] = TH[thName].value;
  });

  return obj;
};

export const reportStopReason = (reason, freezeFrameObj) => {
  if(reason) {
    const obj = Object.assign({reason: reason}, freezeFrameObj ? freezeFrameObj : freezeFrame());
    console.log("reportStopReason obj", obj);
    mqttPublish(HP.board.mqttClient, 'hp/stopReason', obj);

  }
};


export const boilerControlTHValid = () => {
//  const currentTimestamp = unixtimestamp();
  if(TH.boilerUpper.active && TH.boilerUpper.value === 0) return false;
  if(TH.boilerMiddle.active && TH.boilerMiddle.value === 0) return false;
  if(TH.boilerLower.active && TH.boilerLower.value === 0) return false;

  return true;
};


export const printChangedTHValues = (thObj, thKey) => {
  if(GLOBALS.debugLevels.th) {
    const thName = Object.keys(TH).filter(objKey => TH[objKey].objectName === thKey)?.name || 'failed to get proper name';
    console.log(`DEBUG: TH ${thName} changed to ${thObj.value}`);
  }
};

export const printTHTable = () => {
  const array = [];
  Object.keys(TH.thI2CReads).map(thKey => {
//    console.log("thKey", thKey);
    const instance = TH.thI2CReads[thKey];
//    console.log("instance", instance);
    const thObject = TH[Object.keys(TH).filter(thObjectKey => TH[thObjectKey].objectName === thKey)[0]];
//    console.log("thObject", thObject);
    array.push({name: thObject.name.toString(), temperature: instance.value});
  });

  console.table(array);
};

export const printHPObject = () => {
  const {board, mqttClient, mqtt, mqttStatus, start, stop, loop, initial, ...rest} = HP;
  return rest;
};

export const printDOObject = () => {
  const {board, initial, ...rest} = DO;
  return rest;
};

export const printAIObject = () => {
  const {board, initial, onChanges, ...rest} = AI;
  return rest;
};

export const resetAlarms = () => {
  HP.alarmA = false;
  HP.alarmAReason = null;
  HP.alarmB = false;
  HP.alarmBReason = null;

  HP.mode = 'stop';

};