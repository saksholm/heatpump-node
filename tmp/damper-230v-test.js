var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== 230VAC DAMPER RELAY TEST ===");
    console.log("Testing damper relay logic side (NO 230VAC CONNECTION)");
    console.log("This tests only the 5V logic control side");
    console.log("---");

    // Define damper relays (shifted by 18 positions)
    const damperRelays = [
        { name: 'Damper Outside', pin: 42, relayType: 'NO' },
        { name: 'Damper Convection', pin: 43, relayType: 'NO' }
    ];

    // Initialize damper relays
    damperRelays.forEach(relay => {
        relay.output = new five.Relay(relay.pin, relay.relayType);
        relay.output.close(); // Start with dampers closed
    });

    let currentRelayIndex = 0;

    function testDamperRelay() {
        if (currentRelayIndex >= damperRelays.length) {
            console.log("\n=== ALL DAMPER RELAY TESTS COMPLETE ===");
            console.log("If relay LEDs/indicators responded:");
            console.log("1. The logic side is working");
            console.log("2. Check 230VAC power supply to dampers");
            console.log("3. Check damper motor connections");
            console.log("4. Verify relay ratings for 230VAC");
            console.log("\nIf relay LEDs/indicators did NOT respond:");
            console.log("1. Check relay board power (5V)");
            console.log("2. Check relay board ground connection");
            console.log("3. Check Arduino to relay board wiring");
            process.exit(0);
            return;
        }

        const relay = damperRelays[currentRelayIndex];
        console.log(`\n--- Testing ${relay.name} (Pin ${relay.pin}) ---`);

        // Test with longer pulses for 230VAC relays
        setTimeout(() => {
            console.log(`${relay.name}: RELAY ON (10 seconds)`);
            console.log("  - Check relay board LED for this channel");
            console.log("  - Listen for relay click sound");
            relay.output.open();

            setTimeout(() => {
                console.log(`${relay.name}: RELAY OFF (5 seconds)`);
                relay.output.close();

                setTimeout(() => {
                    currentRelayIndex++;
                    testDamperRelay();
                }, 2000);
            }, 10000);
        }, 1000);
    }

    // Start testing
    setTimeout(() => {
        testDamperRelay();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping damper relay test...");
        console.log("Turning off all damper relays...");

        damperRelays.forEach(relay => {
            console.log(`Turning OFF: ${relay.name}`);
            relay.output.close();
        });

        setTimeout(() => {
            console.log("All damper relays turned OFF. Exiting...");
            process.exit(0);
        }, 1000);
    });
}); 