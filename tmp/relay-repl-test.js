// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require("@babel/register")({
    presets: ["@babel/preset-env"]
});

var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== RELAY REPL TEST ===");
    console.log("Available commands:");
    console.log("  1-8: Toggle specific relay");
    console.log("  all: Turn all relays ON");
    console.log("  off: Turn all relays OFF");
    console.log("  status: Show current relay status");
    console.log("  exit: Exit the program");
    console.log("---");

    // Define relays with their pins and names
    const relays = [
        { name: 'AHU Fan', pin: 40, relayType: 'NO', state: false },
        { name: 'HP allowed', pin: 41, relayType: 'NC', state: false },
        { name: 'Damper outside', pin: 42, relayType: 'NO', state: false },
        { name: 'Damper convection', pin: 43, relayType: 'NO', state: false },
        { name: 'Waterpump charging', pin: 44, relayType: 'NO', state: false },
        { name: 'CHG pump request', pin: 45, relayType: 'NO', state: false },
        { name: 'HP 4-way valve', pin: 46, relayType: 'NO', state: false },
        { name: 'HP fan', pin: 47, relayType: 'NO', state: false }
    ];

    // Initialize relay objects
    relays.forEach((relay, index) => {
        // Set pin mode to OUTPUT (though Johnny-Five Relay does this automatically)
        board.pinMode(relay.pin, board.MODES.OUTPUT);
        relay.output = new five.Relay(relay.pin, relay.relayType);
        relay.output.close(); // Start with all relays OFF
        relay.index = index + 1; // Add 1-based index for commands
    });

    // Wait for initialization to complete
    setTimeout(() => {
        console.log("All relays initialized. Ready for commands.");
        console.log("---");
        startREPL();
    }, 2000);

    function toggleRelay(relayIndex) {
        const relay = relays[relayIndex - 1]; // Convert to 0-based index
        if (!relay) {
            console.log(`Invalid relay number: ${relayIndex}. Use 1-8.`);
            return;
        }

        relay.state = !relay.state;

        if (relay.state) {
            relay.output.open();
            console.log(`Relay ${relayIndex} (${relay.name}): ON`);
        } else {
            relay.output.close();
            console.log(`Relay ${relayIndex} (${relay.name}): OFF`);
        }
    }

    function turnAllOn() {
        console.log("Turning all relays ON...");
        relays.forEach((relay, index) => {
            relay.state = true;
            relay.output.open();
            console.log(`Relay ${index + 1} (${relay.name}): ON`);
        });
    }

    function turnAllOff() {
        console.log("Turning all relays OFF...");
        relays.forEach((relay, index) => {
            relay.state = false;
            relay.output.close();
            console.log(`Relay ${index + 1} (${relay.name}): OFF`);
        });
    }

    function showStatus() {
        console.log("\n=== RELAY STATUS ===");
        relays.forEach((relay, index) => {
            const status = relay.state ? "ON" : "OFF";
            console.log(`Relay ${index + 1}: ${relay.name} - ${status}`);
        });
        console.log("---");
    }

    function startREPL() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'relay> '
        });

        rl.prompt();

        rl.on('line', (line) => {
            const command = line.trim().toLowerCase();

            switch (command) {
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    toggleRelay(parseInt(command));
                    break;
                case 'all':
                    turnAllOn();
                    break;
                case 'off':
                    turnAllOff();
                    break;
                case 'status':
                    showStatus();
                    break;
                case 'exit':
                case 'quit':
                    console.log("Exiting...");
                    turnAllOff();
                    setTimeout(() => {
                        rl.close();
                        process.exit(0);
                    }, 1000);
                    return;
                case '':
                    // Empty line, just show prompt
                    break;
                default:
                    console.log(`Unknown command: ${command}`);
                    console.log("Available commands: 1-8, all, off, status, exit");
                    break;
            }
            rl.prompt();
        });

        rl.on('close', () => {
            console.log("REPL closed. Exiting...");
            process.exit(0);
        });
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