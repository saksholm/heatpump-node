var five = require("johnny-five");
var board = new five.Board({
    port: "/dev/ttyACM0",
});

board.on("ready", function () {
    console.log("=== PIN 42 DIAGNOSTIC TEST ===");
    console.log("Testing pin 42 specifically (Damper Outside)");
    console.log("---");

    let testPhase = 0;

    function testPin42() {
        switch (testPhase) {
            case 0:
                console.log("\n--- PHASE 1: Testing pin 42 with Johnny-Five Relay ---");
                testJohnnyFiveRelay();
                break;
            case 1:
                console.log("\n--- PHASE 2: Testing pin 42 with direct digitalWrite ---");
                testDirectDigitalWrite();
                break;
            case 2:
                console.log("\n--- PHASE 3: Testing pin 42 with pinMode + digitalWrite ---");
                testPinModeDigitalWrite();
                break;
            case 3:
                console.log("\n--- PHASE 4: Testing pin 42 with rapid pulses ---");
                testRapidPulses();
                break;
            case 4:
                console.log("\n=== PIN 42 TEST COMPLETE ===");
                console.log("If pin 42 showed no response in any phase:");
                console.log("1. Check wiring to pin 42");
                console.log("2. Check relay board connection for pin 42");
                console.log("3. Arduino pin 42 might be damaged");
                console.log("4. Relay board relay for pin 42 might be damaged");
                process.exit(0);
                return;
        }
    }

    function testJohnnyFiveRelay() {
        console.log("Creating Johnny-Five Relay on pin 42...");
        const relay = new five.Relay(42, 'NO');

        setTimeout(() => {
            console.log("Pin 42: ON (Johnny-Five Relay, 10 seconds)");
            console.log("  - Check relay board LED for pin 42");
            console.log("  - Listen for relay click sound");
            relay.open();

            setTimeout(() => {
                console.log("Pin 42: OFF (Johnny-Five Relay)");
                relay.close();

                setTimeout(() => {
                    testPhase++;
                    testPin42();
                }, 2000);
            }, 10000);
        }, 1000);
    }

    function testDirectDigitalWrite() {
        console.log("Testing direct digitalWrite on pin 42...");

        setTimeout(() => {
            console.log("Pin 42: HIGH (direct digitalWrite, 10 seconds)");
            board.digitalWrite(42, board.HIGH);

            setTimeout(() => {
                console.log("Pin 42: LOW (direct digitalWrite)");
                board.digitalWrite(42, board.LOW);

                setTimeout(() => {
                    testPhase++;
                    testPin42();
                }, 2000);
            }, 10000);
        }, 1000);
    }

    function testPinModeDigitalWrite() {
        console.log("Testing pinMode + digitalWrite on pin 42...");

        setTimeout(() => {
            console.log("Setting pin 42 to OUTPUT mode...");
            board.pinMode(42, board.MODES.OUTPUT);

            setTimeout(() => {
                console.log("Pin 42: HIGH (pinMode + digitalWrite, 10 seconds)");
                board.digitalWrite(42, board.HIGH);

                setTimeout(() => {
                    console.log("Pin 42: LOW (pinMode + digitalWrite)");
                    board.digitalWrite(42, board.LOW);

                    setTimeout(() => {
                        testPhase++;
                        testPin42();
                    }, 2000);
                }, 10000);
            }, 1000);
        }, 1000);
    }

    function testRapidPulses() {
        console.log("Testing rapid pulses on pin 42...");

        let pulseCount = 0;
        const maxPulses = 20;

        const pulseInterval = setInterval(() => {
            if (pulseCount % 2 === 0) {
                console.log(`Pulse ${pulseCount / 2 + 1}: Pin 42 HIGH`);
                board.digitalWrite(42, board.HIGH);
            } else {
                console.log(`Pulse ${pulseCount / 2}: Pin 42 LOW`);
                board.digitalWrite(42, board.LOW);
            }

            pulseCount++;

            if (pulseCount >= maxPulses) {
                clearInterval(pulseInterval);
                board.digitalWrite(42, board.LOW);
                setTimeout(() => {
                    testPhase++;
                    testPin42();
                }, 2000);
            }
        }, 500);
    }

    // Start testing
    setTimeout(() => {
        testPin42();
    }, 2000);

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log("\nStopping pin 42 test...");
        board.digitalWrite(42, board.LOW);
        setTimeout(() => {
            console.log("Pin 42 set LOW. Exiting...");
            process.exit(0);
        }, 500);
    });
}); 