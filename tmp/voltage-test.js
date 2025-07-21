var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== VOLTAGE/POWER DIAGNOSTIC ===");
    console.log("Testing if Arduino is getting proper power");
    console.log("---");

    // Test basic Arduino functionality
    console.log("1. Testing built-in LED...");
    const led = new five.Led(13);

    // Test LED functionality
    setTimeout(() => {
        console.log("   LED ON");
        led.on();

        setTimeout(() => {
            console.log("   LED OFF");
            led.off();

            // Test analog read to check power stability
            console.log("2. Testing analog read stability...");
            testAnalogRead();

        }, 1000);
    }, 1000);

    function testAnalogRead() {
        let readings = [];
        let count = 0;

        const testInterval = setInterval(() => {
            // Read from A0 (should be floating, but we can see if readings are stable)
            board.analogRead(0, (value) => {
                readings.push(value);
                count++;

                if (count >= 10) {
                    clearInterval(testInterval);

                    const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
                    const variance = readings.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / readings.length;

                    console.log(`   Average reading: ${avg.toFixed(2)}`);
                    console.log(`   Variance: ${variance.toFixed(2)}`);
                    console.log(`   Readings: [${readings.map(r => r.toFixed(1)).join(', ')}]`);

                    if (variance < 1.0) {
                        console.log("   ✓ Analog readings are stable (good power)");
                    } else {
                        console.log("   ⚠ Analog readings are unstable (possible power issue)");
                    }

                    // Test digital output
                    console.log("3. Testing digital output...");
                    testDigitalOutput();
                }
            });
        }, 200);
    }

    function testDigitalOutput() {
        const testPin = 40;

        console.log(`   Setting pin ${testPin} to OUTPUT mode...`);
        board.pinMode(testPin, board.MODES.OUTPUT);

        setTimeout(() => {
            console.log(`   Setting pin ${testPin} HIGH...`);
            board.digitalWrite(testPin, board.HIGH);

            setTimeout(() => {
                console.log(`   Setting pin ${testPin} LOW...`);
                board.digitalWrite(testPin, board.LOW);

                console.log("4. Testing PWM output...");
                testPWMOutput();

            }, 1000);
        }, 1000);
    }

    function testPWMOutput() {
        const testPin = 6; // PWM capable pin

        console.log(`   Testing PWM on pin ${testPin}...`);
        board.pinMode(testPin, board.MODES.PWM);

        setTimeout(() => {
            console.log("   PWM 50%...");
            board.analogWrite(testPin, 128);

            setTimeout(() => {
                console.log("   PWM 100%...");
                board.analogWrite(testPin, 255);

                setTimeout(() => {
                    console.log("   PWM 0%...");
                    board.analogWrite(testPin, 0);

                    console.log("\n=== DIAGNOSTIC COMPLETE ===");
                    console.log("If all tests passed, the Arduino is working correctly.");
                    console.log("The relay issue is likely:");
                    console.log("1. Relay board power connection");
                    console.log("2. Relay board logic level compatibility");
                    console.log("3. Physical wiring between Arduino and relay board");
                    console.log("4. Voltage regulator not providing enough current");

                    process.exit(0);
                }, 1000);
            }, 1000);
        }, 1000);
    }

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping voltage test...");
        led.off();
        board.digitalWrite(40, board.LOW);
        board.analogWrite(6, 0);
        setTimeout(() => {
            console.log("All outputs turned OFF. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 