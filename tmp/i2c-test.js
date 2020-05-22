var five = require("johnny-five");
var board = new five.Board({
  port: "/dev/tty.usbmodem14101",
});

board.on("ready", function () {
  var write = (message) => {
    this.i2cWrite(0x02, Array.from(message, c => c.charCodeAt(0)));
  };


  this.i2cConfig({
//    address: 1,
  });
//  this.repl.inject({ write });

//  write("Hello World");


  let i = 0;
  let thObj = {};
  let slaveUnoLastHearbeat = 0;
  setInterval(() => {


    this.i2cReadOnce(0x02, 28, function(bytes) {
     console.log(i++);
     console.log("Bytes read: ", bytes);
     const arrSum = arr => arr.reduce((a,b) => a + b, 0)
     console.log("bytes sum:",arrSum(bytes));

     readTH(bytes, thObj);
    });
    console.log(new Date());
    console.log("thObj", thObj);
  }, 1000);

});


const readTH = (bytes,thObj,ret=false) => {
  let pairs = [];
  let buf;
  let thCount = 1;
  for(let i=0, length=bytes.length; i<length; i++) {
    const byte = bytes[i];
    if(pairs.length <= 2) {
      pairs.push(byte);
    }
    if(pairs.length === 2) {
      buf = Buffer.from(pairs);
      const int = buf.readInt16BE(0);
      const scale = 100;
      const th = int/scale;

      console.log("data", pairs, int, th);

      if(th !== thObj[`th${thCount}`].value) {
        thObj[`th${thCount}`] = {
          value: th !== -327.68 ? th : null,
          timestamp: new Date().unixtimestamp,
        };
      }

      thCount++;
      pairs = [];
    }
  }
  if(ret) return thObj;
}
