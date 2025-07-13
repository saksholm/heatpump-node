var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== 4-WAY VALVE TEST ===");
    console.log("Testing if pin 42 controls the 4-way valve");
    console.log("Listen for the distinctive 4-way valve 'click' sound");
    console.log("---");

    console.log("Setting pin 42 to OUTPUT mode...");
    board.pinMode(42, board.MODES.OUTPUT);

    let testCount = 0;
    const maxTests = 5;

    function test4WayValve() {
        if (testCount >= maxTests) {
            console.log("\n=== 4-WAY VALVE TEST COMPLETE ===");
            console.log("If you heard clicking sounds, pin 42 controls the 4-way valve");
            console.log("This confirms the pin mapping for this relay");
            process.exit(0);
            return;
        }

        testCount++;
        console.log(`\n--- Test ${testCount}/${maxTests} ---`);

        setTimeout(() => {
            console.log("Pin 42: HIGH (4-way valve should click ON)");
            board.digitalWrite(42, board.HIGH);

            setTimeout(() => {
                console.log("Pin 42: LOW (4-way valve should click OFF)");
                board.digitalWrite(42, board.LOW);

                setTimeout(() => {
                    test4WayValve();
                }, 3000); // Wait 3 seconds between tests
            }, 2000); // Keep ON for 2 seconds
        }, 1000);
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