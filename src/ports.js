/*
  "reserved" ports :D
  ... just a memo basically
*/

export const PORTS = {
  digital: {
    D0: 0, // RX
    D1: 0, // TX
    PWM: {
      D2: 'ahuFanOutput',
      D3: 'load2Way',
      D4: 'hpFanOutput',
      D5: 'hpOutput',
      D6: 0,
      D7: 0,
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
    D34: 0,
    D35: 'outside',
    D36: 'beforeCHG',
    D37: 'betweenCHG_CX',
    D38: 'betweenCX_FAN',
    D39: 'exhaust',
    D40: 'glygolIn',
    D41: 'glygolOut',
    D42: 'hotgas',
    D43: 'fluidline',
    D44: 'hxIn',
    D45: 'hxOut',
    D46: 'boilerUpper',
    D47: 'boilerMiddle',
    D48: 'boilerLower',
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
