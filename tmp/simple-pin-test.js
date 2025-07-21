var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== BASIC ARDUINO TEST ===");
    console.log("Testing Arduino without any relay connections");
    console.log("This will verify the Arduino is working correctly");
    console.log("---");

    // Test built-in LED only
    console.log("Testing built-in LED on pin 13...");
    const led = new five.Led(13);

    let count = 0;
    const maxBlinks = 10;

    const blinkInterval = setInterval(() => {
        if (count % 2 === 0) {
            console.log(`Blink ${count / 2 + 1}: LED ON`);
            led.on();
        } else {
            console.log(`Blink ${count / 2}: LED OFF`);
            led.off();
        }

        count++;

        if (count >= maxBlinks * 2) {
            clearInterval(blinkInterval);
            led.off();
            console.log("\n=== TEST COMPLETE ===");
            console.log("If the LED blinked correctly, the Arduino is working.");
            console.log("The issue is with the relay board or power supply.");
            console.log("\nNEXT STEPS:");
            console.log("1. Disconnect ALL relay board connections");
            console.log("2. Check relay board for shorts (VCC to GND resistance)");
            console.log("3. Verify power supply connections");
            console.log("4. Check if converter is getting too hot (safety issue)");
            process.exit(0);
        }
    }, 1000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping test...");
        led.off();
        clearInterval(blinkInterval);
        setTimeout(() => {
            console.log("LED turned OFF. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 