var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== 4-WAY VALVE LONG PULSE TEST ===");
    console.log("Testing 4-way valve with longer pulses for reliable switching");
    console.log("---");

    console.log("Setting pin 42 to OUTPUT mode...");
    board.pinMode(42, board.MODES.OUTPUT);

    let testCount = 0;
    const maxTests = 3;

    function test4WayValve() {
        if (testCount >= maxTests) {
            console.log("\n=== 4-WAY VALVE TEST COMPLETE ===");
            console.log("If valve clicked consistently, pin 42 is working correctly");
            console.log("The 4-way valve needs longer pulses to switch reliably");
            process.exit(0);
            return;
        }

        testCount++;
        console.log(`\n--- Test ${testCount}/${maxTests} ---`);

        setTimeout(() => {
            console.log("Pin 42: HIGH (5 seconds - valve should click ON)");
            board.digitalWrite(42, board.HIGH);

            setTimeout(() => {
                console.log("Pin 42: LOW (5 seconds - valve should click OFF)");
                board.digitalWrite(42, board.LOW);

                setTimeout(() => {
                    test4WayValve();
                }, 5000); // Wait 5 seconds between tests
            }, 5000); // Keep ON for 5 seconds
        }, 2000);
    }

    // Start testing
    setTimeout(() => {
        test4WayValve();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping 4-way valve test...");
        board.digitalWrite(42, board.LOW);
        setTimeout(() => {
            console.log("Pin 42 set LOW. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 