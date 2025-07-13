// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require("@babel/register")({
    presets: ["@babel/preset-env"]
});

var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("Starting relay test...");
    console.log("Will cycle through all relays: ON (3s) -> OFF (3s) -> next relay");
    console.log("---");

    // Define relays directly with their pins and names
    const relays = [
        { name: 'AHU Fan', pin: 40, relayType: 'NO' },
        { name: 'HP allowed', pin: 41, relayType: 'NC' },
        { name: 'Damper outside', pin: 42, relayType: 'NO' },
        { name: 'Damper convection', pin: 43, relayType: 'NO' },
        { name: 'Waterpump charging', pin: 44, relayType: 'NO' },
        { name: 'CHG pump request', pin: 45, relayType: 'NO' },
        { name: 'HP 4-way valve', pin: 46, relayType: 'NO' },
        { name: 'HP fan', pin: 47, relayType: 'NO' },
        { name: 'HP CG 3-way valve', pin: 0, relayType: 'NO' }
    ];

    // Initialize relay objects
    relays.forEach(relay => {
        relay.output = new five.Relay(relay.pin, relay.relayType);
        relay.output.close(); // Start with all relays OFF
    });

    // Wait for initialization to complete
    setTimeout(() => {
        startRelayTest();
    }, 2000);

    function startRelayTest() {
        let currentRelayIndex = 0;

        function testNextRelay() {
            if (currentRelayIndex >= relays.length) {
                console.log("All relays tested! Turning all relays OFF and exiting...");

                // Turn off all relays
                relays.forEach(relay => {
                    console.log(`Turning OFF: ${relay.name}`);
                    relay.output.close();
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
            relay.output.open();

            // Wait 3 seconds, then turn OFF
            setTimeout(() => {
                console.log(`${relay.name}: OFF`);
                relay.output.close();

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
        relays.forEach(relay => {
            console.log(`Turning OFF: ${relay.name}`);
            relay.output.close();
        });

        setTimeout(() => {
            console.log("All relays turned OFF. Exiting...");
            process.exit(0);
        }, 1000);
    });
}); 