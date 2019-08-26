/*
  reverse ports :D
*/

const ports = {
  digital: {
    D0: 0, // RX
    D1: 0, // TX
    PWM: {
      D2: 'ahuFanOutput',
      D3: 0,
      D4: 0,
      D5: 0,
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
    D30: 0,
    D31: 0,
    D32: 0,
    D33: 0,
    D34: 0,
    D35: 0,
    D36: 0,
    D37: 0,
    D38: 0,
    D39: 0,
    D40: 0,
    D41: 0,
    D42: 0,
    D43: 0,
    D44: 0,
    D45: 0,
    D46: 0,
    D47: 0,
    D48: 0,
    D49: 0,
    D50: 0, // SPI - MISO
    D51: 0, // SPI - MOSI
    D52: 0, // SPI - SCK
    D53: 0, // SPI - SS
  },
  analog: {
    A0: 0,
    A1: 'outside',
    A2: 'beforeCHG',
    A3: 'betweenCHG_CX',
    A4: 'betweenCX_FAN',
    A5: 'exhaust',
    A6: 'glygolIn',
    A7: 'glygolOut',
    A8: 'hotgas',
    A9: 'fluidline',
    A10: 'hxIn',
    A11: 'hxOut',
    A12: 'boilerUpper',
    A13: 'boilerMiddle',
    A14: 'boilerLower',
    A15: 0,
  },
};
