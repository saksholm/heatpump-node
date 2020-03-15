import five from 'johnny-five';

const board = new five.Board({
  port: '/dev/cu.usbmodem14201',
  timeout: 3600,
  debug: true,
});

board.on('ready', function() {
  console.log("we are ready!!");

  const th1 = new five.Thermometer({controller: "DS18B20", pin: 35, freq: 2000});
  const th2 = new five.Thermometer({controller: "DS18B20", pin: 38, freq: 2000});
//  const th3 = new five.Thermometer({controller: "DS18B20", pin: 37, freq: 2000});


  th1.on("change", function() {
    const {celsius, address} = th1;

    console.log(`TH1 Thermometer at address: 0x${address.toString(16)}`);
    console.log(`TH1 ${celsius}C`);
    console.warn(`TH1 value changed to ${celsius}`);
  });

  th2.on("change", function() {
    const x = th2;
    const name = "TH2";
    const {celsius, address} = x;

    console.log(`${name} Thermometer at address: 0x${address.toString(16)}`);
    console.log(`${name} ${celsius}C`);
    console.warn(`${name} value changed to ${celsius}`);
  });
/*
  th3.on("change", function() {
    const x = th3;
    const name = "TH3";
    const {celsius, address} = x;

    console.log(`${name} Thermometer at address: 0x${address.toString(16)}`);
    console.log(`${name} ${celsius}C`);
    console.warn(`${name} value changed to ${celsius}`);
  });
*/
});

board.on("error", function(error) {
  console.log("error", error);
});

board.on("message", function(event) {
  console.log("Received a %s message, from %s, reporting: %s", event.type, event.class, event.message);
});

board.on("fail", function(event) {
  console.log("%s sent a 'fail' message: %s", event.class, event.message);
});

board.on("warn", function(event) {
  console.log("%s sent a 'warn' message: %s", event.class, event.message);
});
