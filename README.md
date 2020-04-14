# heatpump-node
Heatpump node.js version, (c) Joni Saksholm 2019-

Custom app to control really customized heatpump system.

Basic tech:
- Arduino Mega2560 board with ConfigurableFirmata
- Arduino Uno board for 14 pcs DS18B20 sensors with custom firmware and communicate to Mega board via I2C
- Rpi (or any computer) connected to Mega2560 via USB-cable
- node.js app with Johnny-five, mqtt, date-fns, node-pid-controller libraries
- integrated to Home Assistant via mqtt




Any commercial use is prohibited.
Contact if you want to use this with license.

I do not accept any responsibility for use.
No warranty.
