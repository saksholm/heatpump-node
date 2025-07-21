nothen var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== DAMPER RELAY TEST ===");
    console.log("Testing damper relays specifically");
    console.log("---");

    // Define damper relays
    const damperRelays = [
        { name: 'Damper Outside', pin: 24, relayType: 'NO' },
        { name: 'Damper Convection', pin: 25, relayType: 'NO' }
    ];

    // Initialize damper relays
    damperRelays.forEach(relay => {
        relay.output = new five.Relay(relay.pin, relay.relayType);
        relay.output.close(); // Start with dampers closed
    });

    let currentRelayIndex = 0;
    let testPhase = 0;

    function testDamper() {
        if (currentRelayIndex >= damperRelays.length) {
            console.log("\n=== ALL DAMPER TESTS COMPLETE ===");
            console.log("If dampers didn't respond, check:");
            console.log("1. Physical damper connections");
            console.log("2. Damper power supply");
            console.log("3. Relay board connections");
            console.log("4. Damper motor/actuator functionality");
            process.exit(0);
            return;
        }

        const relay = damperRelays[currentRelayIndex];

        switch (testPhase) {
            case 0:
                console.log(`\n--- Testing ${relay.name} (Pin ${relay.pin}) ---`);
                console.log("Phase 1: Testing relay with Johnny-Five");
                testJohnnyFiveRelay(relay);
                break;
            case 1:
                console.log("Phase 2: Testing with direct digitalWrite");
                testDirectDigitalWrite(relay);
                break;
            case 2:
                console.log("Phase 3: Testing with longer pulses");
                testLongPulses(relay);
                break;
            case 3:
                // Move to next relay
                currentRelayIndex++;
                testPhase = 0;
                setTimeout(() => {
                    testDamper();
                }, 2000);
                return;
        }
    }

    function testJohnnyFiveRelay(relay) {
        setTimeout(() => {
            console.log(`${relay.name}: OPEN (5 seconds)`);
            relay.output.open();

            setTimeout(() => {
                console.log(`${relay.name}: CLOSE (5 seconds)`);
                relay.output.close();

                setTimeout(() => {
                    testPhase++;
                    testDamper();
                }, 2000);
            }, 5000);
        }, 1000);
    }

    function testDirectDigitalWrite(relay) {
        setTimeout(() => {
            console.log(`${relay.name}: HIGH (direct digitalWrite, 5 seconds)`);
            board.digitalWrite(relay.pin, board.HIGH);

            setTimeout(() => {
                console.log(`${relay.name}: LOW (direct digitalWrite, 5 seconds)`);
                board.digitalWrite(relay.pin, board.LOW);

                setTimeout(() => {
                    testPhase++;
                    testDamper();
                }, 2000);
            }, 5000);
        }, 1000);
    }

    function testLongPulses(relay) {
        setTimeout(() => {
            console.log(`${relay.name}: HIGH (long pulse, 10 seconds)`);
            board.digitalWrite(relay.pin, board.HIGH);

            setTimeout(() => {
                console.log(`${relay.name}: LOW (long pulse, 10 seconds)`);
                board.digitalWrite(relay.pin, board.LOW);

                setTimeout(() => {
                    testPhase++;
                    testDamper();
                }, 2000);
            }, 10000);
        }, 1000);
    }

    // Start testing
    setTimeout(() => {
        testDamper();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping damper test...");
        console.log("Closing all dampers...");

        damperRelays.forEach(relay => {
            console.log(`Closing: ${relay.name}`);
            relay.output.close();
            board.digitalWrite(relay.pin, board.LOW);
        });

        setTimeout(() => {
            console.log("All dampers closed. Exiting...");
            process.exit(0);
        }, 1000);
    });
}); 