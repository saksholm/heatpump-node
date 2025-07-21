var five = require("johnny-five");

console.log("=== ARDUINO CONNECTIVITY TEST ===");
console.log("Testing basic connection to Arduino");
console.log("---");

// Try to connect to Arduino
var board = new five.Board({
    port: "/dev/ttyACM0",
    timeout: 10000, // 10 second timeout
});

board.on("ready", function () {
    console.log("✅ Arduino connected successfully!");
    console.log("✅ Johnny-Five is working!");
    console.log("✅ Serial communication is established!");

    // Try the simplest possible test
    console.log("Testing built-in LED...");
    const led = new five.Led(13);

    setTimeout(() => {
        console.log("LED should be ON now");
        led.on();

        setTimeout(() => {
            console.log("LED should be OFF now");
            led.off();

            console.log("\n=== CONNECTIVITY TEST PASSED ===");
            console.log("Arduino is working correctly!");
            console.log("The issue is with the relay board or connections.");
            process.exit(0);
        }, 3000);
    }, 2000);
});

board.on("error", function (error) {
    console.log("❌ Arduino connection error:");
    console.log(error.message);
    console.log("\nPossible causes:");
    console.log("1. Arduino not powered on");
    console.log("2. Wrong serial port (/dev/ttyACM0)");
    console.log("3. USB cable not connected");
    console.log("4. Arduino firmware issue");
    process.exit(1);
});

// Handle process interruption
process.on('SIGINT', () => {
    console.log("\nStopping connectivity test...");
    process.exit(0);
}); 