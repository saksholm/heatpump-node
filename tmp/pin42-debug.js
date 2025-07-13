var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== PIN 42 DEBUG TEST ===");
    console.log("Testing if pin 42 is actually receiving commands");
    console.log("---");

    console.log("1. Setting pin 42 to OUTPUT mode...");
    board.pinMode(42, board.MODES.OUTPUT);

    setTimeout(() => {
        console.log("2. Testing pin 42 with different methods...");

        // Test 1: Direct digitalWrite
        console.log("   Test 1: Direct digitalWrite HIGH");
        board.digitalWrite(42, board.HIGH);

        setTimeout(() => {
            console.log("   Test 1: Direct digitalWrite LOW");
            board.digitalWrite(42, board.LOW);

            setTimeout(() => {
                // Test 2: Johnny-Five Relay
                console.log("   Test 2: Creating Johnny-Five Relay");
                const relay = new five.Relay(42, 'NO');

                setTimeout(() => {
                    console.log("   Test 2: Relay.open()");
                    relay.open();

                    setTimeout(() => {
                        console.log("   Test 2: Relay.close()");
                        relay.close();

                        setTimeout(() => {
                            // Test 3: Rapid pulses
                            console.log("   Test 3: Rapid pulses (10 times)");
                            let pulseCount = 0;
                            const maxPulses = 10;

                            const pulseInterval = setInterval(() => {
                                if (pulseCount % 2 === 0) {
                                    console.log(`   Pulse ${pulseCount / 2 + 1}: HIGH`);
                                    board.digitalWrite(42, board.HIGH);
                                } else {
                                    console.log(`   Pulse ${pulseCount / 2}: LOW`);
                                    board.digitalWrite(42, board.LOW);
                                }

                                pulseCount++;

                                if (pulseCount >= maxPulses) {
                                    clearInterval(pulseInterval);
                                    board.digitalWrite(42, board.LOW);

                                    console.log("\n=== PIN 42 DEBUG COMPLETE ===");
                                    console.log("If you heard NO clicks during any test:");
                                    console.log("1. Pin 42 might be damaged");
                                    console.log("2. Relay board relay for pin 42 might be damaged");
                                    console.log("3. Wiring to pin 42 might be loose");
                                    console.log("4. Relay board might not be getting enough power");
                                    process.exit(0);
                                }
                            }, 500);

                        }, 2000);
                    }, 2000);
                }, 2000);
            }, 2000);
        }, 2000);
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping pin 42 debug...");
        board.digitalWrite(42, board.LOW);
        setTimeout(() => {
            console.log("Pin 42 set LOW. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 