var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== RELAY DIAGNOSTIC TEST ===");
    console.log("This will test multiple pins and methods to isolate the issue");
    console.log("Press Ctrl+C to stop");
    console.log("---");

    // Test multiple pins with different approaches
    const testPins = [40, 41, 42, 43]; // Pins far from your original relay pins
    let currentPinIndex = 0;
    let testPhase = 0;

    function runDiagnostic() {
        const pin = testPins[currentPinIndex];

        switch (testPhase) {
            case 0:
                console.log(`\n--- PHASE 1: Testing pin ${pin} with Johnny-Five Relay ---`);
                testJohnnyFiveRelay(pin);
                break;
            case 1:
                console.log(`\n--- PHASE 2: Testing pin ${pin} with direct digitalWrite ---`);
                testDirectDigitalWrite(pin);
                break;
            case 2:
                console.log(`\n--- PHASE 3: Testing pin ${pin} with pinMode + digitalWrite ---`);
                testPinModeDigitalWrite(pin);
                break;
            case 3:
                // Move to next pin
                currentPinIndex++;
                testPhase = 0;
                if (currentPinIndex >= testPins.length) {
                    console.log("\n=== ALL TESTS COMPLETE ===");
                    console.log("If none of these tests worked, check:");
                    console.log("1. Physical wiring between Mega and relay board");
                    console.log("2. Power supply to relay board (VCC and GND)");
                    console.log("3. Logic level compatibility (3.3V vs 5V)");
                    console.log("4. Relay board enable/select pins");
                    process.exit(0);
                }
                runDiagnostic();
                return;
        }
    }

    function testJohnnyFiveRelay(pin) {
        console.log(`Creating Johnny-Five Relay on pin ${pin}...`);
        const relay = new five.Relay(pin, 'NO');

        setTimeout(() => {
            console.log(`Pin ${pin}: ON (Johnny-Five Relay)`);
            relay.open();

            setTimeout(() => {
                console.log(`Pin ${pin}: OFF (Johnny-Five Relay)`);
                relay.close();

                setTimeout(() => {
                    testPhase++;
                    runDiagnostic();
                }, 2000);
            }, 3000);
        }, 1000);
    }

    function testDirectDigitalWrite(pin) {
        console.log(`Testing direct digitalWrite on pin ${pin}...`);

        setTimeout(() => {
            console.log(`Pin ${pin}: HIGH (direct digitalWrite)`);
            board.digitalWrite(pin, board.HIGH);

            setTimeout(() => {
                console.log(`Pin ${pin}: LOW (direct digitalWrite)`);
                board.digitalWrite(pin, board.LOW);

                setTimeout(() => {
                    testPhase++;
                    runDiagnostic();
                }, 2000);
            }, 3000);
        }, 1000);
    }

    function testPinModeDigitalWrite(pin) {
        console.log(`Testing pinMode + digitalWrite on pin ${pin}...`);

        setTimeout(() => {
            console.log(`Setting pin ${pin} to OUTPUT mode...`);
            board.pinMode(pin, board.MODES.OUTPUT);

            setTimeout(() => {
                console.log(`Pin ${pin}: HIGH (pinMode + digitalWrite)`);
                board.digitalWrite(pin, board.HIGH);

                setTimeout(() => {
                    console.log(`Pin ${pin}: LOW (pinMode + digitalWrite)`);
                    board.digitalWrite(pin, board.LOW);

                    setTimeout(() => {
                        testPhase++;
                        runDiagnostic();
                    }, 2000);
                }, 3000);
            }, 1000);
        }, 1000);
    }

    // Start the diagnostic
    setTimeout(() => {
        runDiagnostic();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping diagnostic...");
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