# pxt-mmwave-liquid-level-detection-sensor
mmWave - 80GHz Liquid Level Detection Sensor

# Liquid Level Detection – Micro:bit Extension

This extension communicates with a Modbus‑RTU liquid level sensor using UART.

## Blocks

- Initialize sensor (choose RX, TX, baud)
- Read range (m)
- Read empty height (m)
- Set installation height (cm)
- Read installation height (m)
- Read water level (m)

## Wiring

Sensor TX → Microbit RX  
Sensor RX → Microbit TX  
GND → GND  
VCC → 5V (external supply)

## Example

```blocks
LiquidLevelDetection.begin(SerialPin.P1, SerialPin.P2, BaudRate.BaudRate115200)
basic.forever(function () {
    let level = LiquidLevelDetection.getWaterLevel()
    basic.showNumber(level)
})

