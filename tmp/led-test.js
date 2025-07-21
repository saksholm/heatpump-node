var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== LED TEST ===");
    console.log("Testing if Arduino pins are working with an LED");
    console.log("Connect an LED with resistor to pin 13 (built-in LED)");
    console.log("Press Ctrl+C to stop");

    const led = new five.Led(13);

    // Blink the LED
    led.blink(1000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping LED test...");
        led.off();
        setTimeout(() => {
            console.log("LED turned OFF. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 