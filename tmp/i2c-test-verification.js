var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {

    this.i2cConfig({});

    let i = 0;
    let thObj = {};

    console.log("Starting I2C verification test...");
    console.log("Reading 28 bytes from register 99 at address 0x02");
    console.log("Expected: 14 temperature sensors (2 bytes each)");
    console.log("Interval: 2000ms");
    console.log("---");

    // Use i2cRead for continuous reading (no memory leak)
    this.i2cRead(0x02, 99, 28, function (bytes) {
        console.log(`Read #${i++}`);
        console.log("Bytes read: ", bytes);
        console.log("Bytes length: ", bytes.length);

        // Use the same processing logic as the main project
        readTH(bytes, thObj);
        console.log("thObj", thObj);
        console.log("---");
    });

});

const readTH = (bytes, thObj, ret = false) => {
    let pairs = [];
    let buf;
    let thCount = 1;

    for (let i = 0, length = bytes.length; i < length; i++) {
        const byte = bytes[i];
        if (pairs.length <= 2) {
            pairs.push(byte);
        }
        if (pairs.length === 2) {
            buf = Buffer.from(pairs);
            const int = buf.readInt16BE(0);
            const scale = 100;
            const th = int / scale;

            console.log(`Sensor ${thCount}:`, pairs, "-> int:", int, "-> temp:", th);

            thObj[`th${thCount}`] = {
                value: th !== -327.68 ? th : null,
                timestamp: Date.now(),
            };

            thCount++;
            pairs = [];
        }
    }
    if (ret) return thObj;
} 