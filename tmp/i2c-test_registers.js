var five = require("johnny-five");
var board = new five.Board({
  port: "/dev/tty.usbmodem14101",
});

board.on("ready", function () {

  this.i2cConfig({});


  let i = 0;
  let thObj = {};
  let slaveUnoLastHearbeat = 0;
  setInterval(() => {

    this.i2cReadOnce(0x02, 2, 2, function(bytes) {
     console.log(i++);
     console.log("Bytes read: ", bytes);
     readTH(bytes,thObj);
     console.log("thObj", thObj);
    });
  }, 2000);

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

      thObj[`th${thCount}`] = {
        value: th !== -327.68 ? th : null,
        timestamp: new Date().unixtimestamp,
      };


      thCount++;
      pairs = [];
    }
  }
  if(ret) return thObj;
}
