var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("Simple relay test - testing one relay repeatedly");
    console.log("Press Ctrl+C to stop");

    // Test with a single relay on a pin that should be completely different
    const testPin = 40; // Try a pin that's far from your original relay pins
    const relay = new five.Relay(testPin, 'NO');

    let state = false;

    // Toggle the relay every 2 seconds
    setInterval(() => {
        if (state) {
            console.log(`Pin ${testPin}: OFF`);
            relay.close();
        } else {
            console.log(`Pin ${testPin}: ON`);
            relay.open();
        }
        state = !state;
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping test...");
        relay.close();
        setTimeout(() => {
            console.log("Relay turned OFF. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 