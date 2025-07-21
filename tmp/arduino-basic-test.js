var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== BASIC ARDUINO FUNCTIONALITY TEST ===");
    console.log("Testing if Arduino can control pins at all");
    console.log("---");

    // Test built-in LED first (this should always work)
    console.log("1. Testing built-in LED on pin 13...");
    const led = new five.Led(13);

    setTimeout(() => {
        console.log("   LED ON");
        led.on();

        setTimeout(() => {
            console.log("   LED OFF");
            led.off();

            // Test a simple digital output
            console.log("2. Testing simple digital output on pin 40...");
            testSimpleDigitalOutput();

        }, 2000);
    }, 2000);

    function testSimpleDigitalOutput() {
        board.pinMode(40, board.MODES.OUTPUT);

        setTimeout(() => {
            console.log("   Pin 40: HIGH");
            board.digitalWrite(40, board.HIGH);

            setTimeout(() => {
                console.log("   Pin 40: LOW");
                board.digitalWrite(40, board.LOW);

                // Test PWM output
                console.log("3. Testing PWM output on pin 6...");
                testPWMOutput();

            }, 2000);
        }, 2000);
    }

    function testPWMOutput() {
        board.pinMode(6, board.MODES.PWM);

        setTimeout(() => {
            console.log("   Pin 6: PWM 50%");
            board.analogWrite(6, 128);

            setTimeout(() => {
                console.log("   Pin 6: PWM 100%");
                board.analogWrite(6, 255);

                setTimeout(() => {
                    console.log("   Pin 6: PWM 0%");
                    board.analogWrite(6, 0);

                    console.log("\n=== BASIC TEST COMPLETE ===");
                    console.log("If the built-in LED worked:");
                    console.log("  - Arduino is functioning");
                    console.log("  - Johnny-Five is working");
                    console.log("  - Serial communication is good");
                    console.log("\nIf relay board still doesn't respond:");
                    console.log("  - Check relay board power (5V)");
                    console.log("  - Check relay board ground connection");
                    console.log("  - Check wiring between Arduino and relay board");
                    console.log("  - Relay board might be damaged");

                    process.exit(0);
                }, 2000);
            }, 2000);
        }, 2000);
    }

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping basic test...");
        led.off();
        board.digitalWrite(40, board.LOW);
        board.analogWrite(6, 0);
        setTimeout(() => {
            console.log("All outputs turned OFF. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 