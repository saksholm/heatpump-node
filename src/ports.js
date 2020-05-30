/*
  "reserved" ports :D
  ... just a memo basically
*/
//1 = 0x213137fbaaa
//2 = 0x41771942bff
//3 = 0x417721fb0ff
//4 = 0x21316adc9aa
//5 = 0x316a2793460
//6 = 0x319a27948a4

export const PORTS = {
  digital: {
    D0: 0, // RX
    D1: 0, // TX
    PWM: {
      D2: 0,  ///  INT.0
      D3: 0, // INT.1
      D4: 'hpFanOutput',
      D5: 'hpOutput',
      D6: 'ahuFanOutput',,
      D7: 'load2Way',
      D8: 0,
      D9: 0,
      D10: 0,
      D11: 0,
      D12: 0,
      D13: 0, // build in led
    },
    D14: 0, // TX3
    D15: 0, // RX3
    D16: 0, // TX2
    D17: 0, // RX2
    D18: 0, // TX1
    D19: 0, // RX1
    D20: 0, // SPI - SDA
    D21: 0, // SPI - SCL
    D22: 'ahuFan',
    D23: 'hpAllowed',
    D24: 'damperOutside',
    D25: 'damperConvection',
    D26: 'waterpumpCharging',
    D27: 'chgPumpRequest',
    D28: 'hp4Way',
    D29: 'hpFan',
    D30: 'hpAlarm', // in
    D31: 'kwhMeterPulse', //in
    D32: 'chargingWaterpumpFlow', //in
    D33: '3-Phase Monitor',
    D34: 'hotgasOvertemperatureProtection',
    D35: 'Low Pressure Switch', //'outside', // 6th pin on top (right)
    D36: 'High Pressure Switch', //'beforeCHG', // 7th pin on top (left)
    D37: 0, //'betweenCHG_CX', // 7th pin on top (right)
    D38: 0, //'betweenCX_FAN', //8th pin on top (left)
    D39: 0, //'exhaust',
    D40: 0, //'glygolIn',
    D41: 0, //'glygolOut',
    D42: 0, //'hotgas',
    D43: 0, //'fluidline',
    D44: 0, //'hxIn',
    D45: 0, //'hxOut',
    D46: 0, //'boilerUpper',
    D47: 0, //'boilerMiddle',
    D48: 0, //'boilerLower',
    D49: 0,
    D50: 0, // SPI - MISO
    D51: 0, // SPI - MOSI
    D52: 0, // SPI - SCK
    D53: 0, // SPI - SS
  },
  analog: {
    A0: 0,
    A1: 'condenserPde',
    A2: 0,
    A3: 0,
    A4: 0,
    A5: 0,
    A6: 0,
    A7: 0,
    A8: 0,
    A9: 0,
    A10: 0,
    A11: 0,
    A12: 0,
    A13: 0,
    A14: 0,
    A15: 0,
  },
};
