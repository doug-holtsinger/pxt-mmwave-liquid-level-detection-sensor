//% color=#0CAADB icon="\uf043" block="Liquid Level Sensor"
namespace LiquidLevelDetection {

    let deviceAddr = 0x01

    // Redirect UART to chosen pins
    //% block="initialize liquid level sensor with RX %rx TX %tx at %baud baud"
    export function begin(rx: SerialPin, tx: SerialPin, baud: BaudRate): void {
        serial.redirect(tx, rx, baud)
        basic.pause(100)
    }

    //% block="set sensor device address to %addr"
    export function setDeviceAddress(addr: number): void {
        deviceAddr = addr
    }

    // -----------------------------
    // Public API
    // -----------------------------

    //% block="get range (m)"
    export function getRange(): number {
        return readModbusRegister(0x07D4)
    }

    //% block="get empty height (m)"
    export function getEmptyHeight(): number {
        return readModbusRegister(0x0001) / 1000.0
    }

    //% block="set installation height %height_cm cm"
    export function setInstallationHeight(height_cm: number): boolean {
        return sendModbusCommand(0x0005, height_cm)
    }

    //% block="get installation height (m)"
    export function getInstallationHeight(): number {
        return readModbusRegister(0x0005) / 100.0
    }

    //% block="get water level (m)"
    export function getWaterLevel(): number {
        return readModbusRegister(0x0003) / 1000.0
    }

    // -----------------------------
    // Modbus Core
    // -----------------------------

    function sendModbusCommand(reg: number, value: number): boolean {
        let frame = pins.createBuffer(8)
        frame.setUint8(0, deviceAddr)
        frame.setUint8(1, 0x06)
        frame.setUint8(2, reg >> 8)
        frame.setUint8(3, reg & 0xFF)
        frame.setUint8(4, value >> 8)
        frame.setUint8(5, value & 0xFF)

        let crc = crc16(frame, 6)
        frame.setUint8(6, crc & 0xFF)
        frame.setUint8(7, crc >> 8)

        serial.writeBuffer(frame)
        basic.pause(100)

        let resp = serial.readBuffer(8)
        return resp.length >= 8
    }

    function readModbusRegister(reg: number): number {
        let frame = pins.createBuffer(8)
        frame.setUint8(0, deviceAddr)
        frame.setUint8(1, 0x03)
        frame.setUint8(2, reg >> 8)
        frame.setUint8(3, reg & 0xFF)
        frame.setUint8(4, 0x00)
        frame.setUint8(5, 0x01)

        let crc = crc16(frame, 6)
        frame.setUint8(6, crc & 0xFF)
        frame.setUint8(7, crc >> 8)

        serial.writeBuffer(frame)
        basic.pause(100)

        let resp = serial.readBuffer(7)
        if (resp.length >= 5) {
            let high = resp.getUint8(3)
            let low = resp.getUint8(4)
            return (high << 8) | low
        }
        return 0
    }

    // -----------------------------
    // CRC16 (Modbus)
    // -----------------------------
    function crc16(buf: Buffer, len: number): number {
        let crc = 0xFFFF
        for (let i = 0; i < len; i++) {
            crc ^= buf.getUint8(i)
            for (let j = 0; j < 8; j++) {
                if (crc & 0x0001) {
                    crc >>= 1
                    crc ^= 0xA001
                } else {
                    crc >>= 1
                }
            }
        }
        return crc
    }
}
