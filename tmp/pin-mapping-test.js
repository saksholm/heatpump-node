var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== PIN MAPPING TEST ===");
    console.log("Testing which pins actually control which relays");
    console.log("This will help identify the correct pin assignments");
    console.log("---");

    // Test a range of pins to find which ones are actually connected
    const testPins = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53];
    let currentPinIndex = 0;

    function testPin() {
        if (currentPinIndex >= testPins.length) {
            console.log("\n=== PIN MAPPING COMPLETE ===");
            console.log("Based on what you observed:");
            console.log("1. Note which pins showed relay activity (LEDs, clicks)");
            console.log("2. Note which pins showed damper movement");
            console.log("3. Update your pin assignments accordingly");
            process.exit(0);
            return;
        }

        const pin = testPins[currentPinIndex];
        console.log(`\n--- Testing Pin ${pin} ---`);
        console.log("Watch for:");
        console.log("  - Relay board LED lighting up");
        console.log("  - Relay clicking sound");
        console.log("  - Damper movement (if 230VAC connected)");
        console.log("  - Any other relay activity");

        // Set pin to OUTPUT
        board.pinMode(pin, board.MODES.OUTPUT);

        setTimeout(() => {
            console.log(`Pin ${pin}: HIGH (5 seconds)`);
            board.digitalWrite(pin, board.HIGH);

            setTimeout(() => {
                console.log(`Pin ${pin}: LOW (2 seconds)`);
                board.digitalWrite(pin, board.LOW);

                setTimeout(() => {
                    console.log(`Pin ${pin}: HIGH again (3 seconds)`);
                    board.digitalWrite(pin, board.HIGH);

                    setTimeout(() => {
                        console.log(`Pin ${pin}: LOW (final)`);
                        board.digitalWrite(pin, board.LOW);

                        // Move to next pin
                        currentPinIndex++;
                        setTimeout(() => {
                            testPin();
                        }, 2000);

                    }, 3000);
                }, 2000);
            }, 5000);
        }, 1000);
    }

    // Start testing
    setTimeout(() => {
        testPin();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping pin mapping test...");
        console.log("Setting all test pins LOW...");

        testPins.forEach(pin => {
            board.digitalWrite(pin, board.LOW);
        });

        setTimeout(() => {
            console.log("All pins set LOW. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 