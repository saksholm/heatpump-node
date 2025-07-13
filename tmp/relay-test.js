var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("Starting relay test...");
    console.log("Will cycle through all relays: ON (3s) -> OFF (3s) -> next relay");
    console.log("---");

    // Import the DO module
    const { DO } = require('../src/do.js');

    // Initialize DO module
    DO.initial(this);

    // Wait for initialization to complete
    setTimeout(() => {
        startRelayTest();
    }, 5000);

    function startRelayTest() {
        const relays = [
            { name: 'ahuFan', instance: DO.ahuFan },
            { name: 'hpAllowed', instance: DO.hpAllowed },
            { name: 'damperOutside', instance: DO.damperOutside },
            { name: 'damperConvection', instance: DO.damperConvection },
            { name: 'waterpumpCharging', instance: DO.waterpumpCharging },
            { name: 'chgPumpRequest', instance: DO.chgPumpRequest },
            { name: 'hp4Way', instance: DO.hp4Way },
            { name: 'hpFan', instance: DO.hpFan },
            { name: 'hpCGValve', instance: DO.hpCGValve }
        ];

        let currentRelayIndex = 0;

        function testNextRelay() {
            if (currentRelayIndex >= relays.length) {
                console.log("All relays tested! Turning all relays OFF and exiting...");

                // Turn off all relays
                relays.forEach(relay => {
                    console.log(`Turning OFF: ${relay.name}`);
                    relay.instance.set(relay.instance.enum[1]); // Turn off
                });

                setTimeout(() => {
                    console.log("All relays turned OFF. Exiting...");
                    process.exit(0);
                }, 1000);
                return;
            }

            const relay = relays[currentRelayIndex];
            console.log(`\n--- Testing ${relay.name} (${currentRelayIndex + 1}/${relays.length}) ---`);

            // Turn relay ON
            console.log(`${relay.name}: ON`);
            relay.instance.set(relay.instance.enum[0]); // Use first enum value (usually "on")

            // Wait 3 seconds, then turn OFF
            setTimeout(() => {
                console.log(`${relay.name}: OFF`);
                relay.instance.set(relay.instance.enum[1]); // Use second enum value (usually "off")

                // Wait 3 seconds, then test next relay
                setTimeout(() => {
                    currentRelayIndex++;
                    testNextRelay();
                }, 3000);
            }, 3000);
        }

        // Start the test
        testNextRelay();
    }

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping relay test...");
        console.log("Turning all relays OFF...");

        // Turn off all relays
        Object.keys(DO).forEach(key => {
            const instance = DO[key];
            if (instance && instance.type === 'relay' && instance.active) {
                console.log(`Turning OFF: ${instance.name}`);
                instance.set(instance.enum[1]); // Turn off
            }
        });

        setTimeout(() => {
            console.log("All relays turned OFF. Exiting...");
            process.exit(0);
        }, 1000);
    });
}); 