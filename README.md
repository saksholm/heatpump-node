# heatpump-node
Heatpump node.js version

Custom app to control really customized heatpump system.

Basic tech concept:
- Mega2560 board with Firmata Plus
- Rpi (or any computer) connected to Mega2560 via USB-cable
- node.js app with Johnny-five, mqtt, date-fns libraries
- integrated to Home Assistant vie mqtt
