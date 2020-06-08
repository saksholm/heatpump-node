# heatpump-node
Heatpump node.js version, (c) Joni Saksholm 2019-

Custom app to control really customized heatpump system.

Basic tech:
- Arduino Mega2560 board with ConfigurableFirmata
- Arduino Nano board for 14 pcs DS18B20 sensors with custom firmware and communicate to Mega board via I2C
- Rpi (or any computer) connected to Mega2560 via USB-cable
- node.js app with [Johnny-Five](http://johnny-five.io/), [MQTT.js](https://github.com/mqttjs/MQTT.js), [date-fns](https://date-fns.org/), [node-pid-controller](https://github.com/Philmod/node-pid-controller) libraries
- integrated to [Home Assistant](https://www.home-assistant.io/) via mqtt




Any commercial use is prohibited.
Contact if you want to use this with license.

I do not accept any responsibility for use.
No warranty.
