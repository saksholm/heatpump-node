var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== RELAY RESET ATTEMPT ===");
    console.log("Trying to reset the stuck damper convection relay (pin 43)");
    console.log("---");

    // Try multiple methods to reset the stuck relay
    console.log("1. Setting pin 43 to OUTPUT mode...");
    board.pinMode(43, board.MODES.OUTPUT);

    setTimeout(() => {
        console.log("2. Forcing pin 43 LOW (should turn relay OFF)...");
        board.digitalWrite(43, board.LOW);

        setTimeout(() => {
            console.log("3. Testing rapid ON/OFF pulses...");
            let pulseCount = 0;
            const maxPulses = 10;

            const pulseInterval = setInterval(() => {
                if (pulseCount % 2 === 0) {
                    console.log(`Pulse ${pulseCount / 2 + 1}: Pin 43 HIGH`);
                    board.digitalWrite(43, board.HIGH);
                } else {
                    console.log(`Pulse ${pulseCount / 2}: Pin 43 LOW`);
                    board.digitalWrite(43, board.LOW);
                }

                pulseCount++;

                if (pulseCount >= maxPulses) {
                    clearInterval(pulseInterval);
                    console.log("4. Final: Setting pin 43 LOW...");
                    board.digitalWrite(43, board.LOW);

                    setTimeout(() => {
                        console.log("\n=== RELAY RESET COMPLETE ===");
                        console.log("Check if the damper convection relay is now OFF.");
                        console.log("If it's still stuck ON:");
                        console.log("1. The relay might be mechanically stuck");
                        console.log("2. The relay board might have a fault");
                        console.log("3. Try power cycling the relay board");
                        process.exit(0);
                    }, 2000);
                }
            }, 1000);
        }, 2000);
    }, 1000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping relay reset...");
        board.digitalWrite(43, board.LOW);
        setTimeout(() => {
            console.log("Pin 43 set LOW. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 