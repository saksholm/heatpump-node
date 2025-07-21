var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== RELAY BOARD POWER TEST ===");
    console.log("Testing relay board power and signal connections");
    console.log("---");

    // Test with multiple pins and longer pulses
    const testPins = [40, 41, 42, 43];
    let currentPin = 0;

    function testRelayPin() {
        if (currentPin >= testPins.length) {
            console.log("\n=== ALL PINS TESTED ===");
            console.log("If no relays responded, check:");
            console.log("1. Relay board power (VCC and GND)");
            console.log("2. Physical connections to Arduino");
            console.log("3. Relay board enable/select pins");
            console.log("4. Voltage regulator current capacity");
            process.exit(0);
            return;
        }

        const pin = testPins[currentPin];
        console.log(`\n--- Testing pin ${pin} ---`);

        // Set pin to OUTPUT
        board.pinMode(pin, board.MODES.OUTPUT);

        // Test with longer pulses to make sure relay has time to respond
        setTimeout(() => {
            console.log(`Pin ${pin}: HIGH (5 seconds)`);
            board.digitalWrite(pin, board.HIGH);

            setTimeout(() => {
                console.log(`Pin ${pin}: LOW (2 seconds)`);
                board.digitalWrite(pin, board.LOW);

                setTimeout(() => {
                    console.log(`Pin ${pin}: HIGH (3 seconds)`);
                    board.digitalWrite(pin, board.HIGH);

                    setTimeout(() => {
                        console.log(`Pin ${pin}: LOW (final)`);
                        board.digitalWrite(pin, board.LOW);

                        // Move to next pin
                        currentPin++;
                        setTimeout(() => {
                            testRelayPin();
                        }, 1000);

                    }, 3000);
                }, 2000);
            }, 5000);
        }, 1000);
    }

    // Start testing
    setTimeout(() => {
        testRelayPin();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping relay test...");
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