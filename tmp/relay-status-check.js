var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== RELAY STATUS CHECK ===");
    console.log("Checking if relays are actually switching");
    console.log("Watch relay board LEDs and listen for relay clicks");
    console.log("---");

    // Test multiple pins to see which ones are working
    const testPins = [42, 43, 44, 45];
    let currentPin = 0;

    function testRelay() {
        if (currentPin >= testPins.length) {
            console.log("\n=== RELAY STATUS COMPLETE ===");
            console.log("Based on what you observed:");
            console.log("- Which pins showed LED activity?");
            console.log("- Which pins made relay clicking sounds?");
            console.log("- Which pins showed valve/motor activity?");
            process.exit(0);
            return;
        }

        const pin = testPins[currentPin];
        console.log(`\n--- Testing Pin ${pin} ---`);
        console.log("Watch for:");
        console.log("  - Relay board LED for this pin");
        console.log("  - Relay clicking sound");
        console.log("  - Any valve/motor activity");

        // Set pin to OUTPUT
        board.pinMode(pin, board.MODES.OUTPUT);

        setTimeout(() => {
            console.log(`Pin ${pin}: HIGH (10 seconds)`);
            board.digitalWrite(pin, board.HIGH);

            setTimeout(() => {
                console.log(`Pin ${pin}: LOW (5 seconds)`);
                board.digitalWrite(pin, board.LOW);

                setTimeout(() => {
                    console.log(`Pin ${pin}: HIGH again (5 seconds)`);
                    board.digitalWrite(pin, board.HIGH);

                    setTimeout(() => {
                        console.log(`Pin ${pin}: LOW (final)`);
                        board.digitalWrite(pin, board.LOW);

                        // Move to next pin
                        currentPin++;
                        setTimeout(() => {
                            testRelay();
                        }, 3000);

                    }, 5000);
                }, 5000);
            }, 10000);
        }, 2000);
    }

    // Start testing
    setTimeout(() => {
        testRelay();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping relay status check...");
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