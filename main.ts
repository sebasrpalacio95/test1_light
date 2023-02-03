/**
 * makecode APDS9960 Digital Proximity and Ambient Light Sensor package.
 * From microbit/micropython Chinese community.
 * http://www.micropython.org.cn
 */

const APDS9930_I2C_ADDRESS = 0x39
const APDS9930_ENABLE = 0x00
const APDS9930_ATIME = 0x01
const APDS9930_PTIME = 0x02
const APDS9930_WTIME = 0x03
const APDS9930_PERS = 0x0C
const APDS9930_CONFIG = 0x0D
const APDS9930_PPULSE = 0x0E
const APDS9930_CONTROL = 0x0F
const APDS9930_Ch0DATAL = 0x14
const APDS9930_Ch0DATAH = 0x15
const APDS9930_Ch1DATAL = 0x16
const APDS9930_Ch1DATAH = 0x17
const APDS9930_PDATAL = 0x19
const APDS9930_PDATAH = 0x18
const APDS9930_POFFSET = 0x1E

// AGAIN
enum APDS9930_AGAIN {
    AGAIN_1 = 0,
    AGAIN_8 = 1,
    AGAIN_16 = 2,
    AGAIN_120 = 3
};

// PGAIN
enum APDS9930_PGAIN {
    PGAIN_1 = 0,
    PGAIN_2 = 1,
    PGAIN_4 = 2,
    PGAIN_8 = 3
};

// ALS coefficients
const DF = 52
const GA = 490
const B = 1862
const C = 746
const D = 1291

/**
 * APDS9960 mudule
 */
//% weight=100 color=#102010 icon="\uf0eb" block="APDS9930"
namespace APDS9930 {
    let _wbuf = pins.createBuffer(2);
    let _AGAIN = 1;
    let _PGAIN = 3;

    /**
     * set APDS9930's reg
     */
    function setReg(reg: number, dat: number): void {
        _wbuf[0] = reg | 0xE0;
        _wbuf[1] = dat;
        pins.i2cWriteBuffer(APDS9930_I2C_ADDRESS, _wbuf);
    }

    /**
     * get a reg
     */
    function getReg(reg: number): number {
        pins.i2cWriteNumber(APDS9930_I2C_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(APDS9930_I2C_ADDRESS, NumberFormat.UInt8BE);
    }

    /**
     * get two reg, UInt16LE format
     */
    function get2Reg(reg: number): number {
        pins.i2cWriteNumber(APDS9930_I2C_ADDRESS, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(APDS9930_I2C_ADDRESS, NumberFormat.UInt16LE);
    }

    /** 
     * get CH0 value
    */
    function getCH0(): number {
        return get2Reg(APDS9930_Ch0DATAL);
    }

    /** 
     * get CH1 value
    */
    function getCH1(): number {
        return get2Reg(APDS9930_Ch1DATAL);
    }

    /**
     * set ATIME reg 
     */
    function ATIME(v: number) {
        setReg(APDS9930_ATIME, v);
    }

    /**
     * set ALS GAIN
     */
    //% blockId="APDS9960_SET_AGAIN" block="set ALS GAIN %gain"
    //% weight=100 blockGap=8
    export function AGAIN(gain: APDS9930_AGAIN) {
        let t = getReg(APDS9930_CONTROL)
        t &= 0xFC
        switch (gain) {
            case APDS9930_AGAIN.AGAIN_8:
                t |= 1;
                break;
            case APDS9930_AGAIN.AGAIN_16:
                t |= 2;
                break;
            case APDS9930_AGAIN.AGAIN_120:
                t |= 3;
                break;
        }
        setReg(APDS9930_CONTROL, t)
        _AGAIN = gain
    }

    /**
     * set Proximity GAIN
     * @param gain is Proximity GAIN, eg: APDS9930_PGAIN.PGAIN_8
     */
    //% blockId="APDS9960_SET_PGAIN" block="set Proximity GAIN %gain"
    //% weight=100 blockGap=8
    export function PGAIN(gain: APDS9930_PGAIN) {
        let t = getReg(APDS9930_CONTROL)
        t &= 0xF3
        switch (gain) {
            case APDS9930_PGAIN.PGAIN_2:
                t |= 4;
                break;
            case APDS9930_PGAIN.PGAIN_4:
                t |= 8;
                break;
            case APDS9930_PGAIN.PGAIN_8:
                t |= 12;
                break;
        }
        setReg(APDS9930_CONTROL, t)
        _PGAIN = gain
    }

    /**
     * Power On
     */
    //% blockId="APDS9960_ON" block="Power On"
    //% weight=81 blockGap=8
    export function PowerOn() {
        let t = getReg(APDS9930_ENABLE)
        t |= 1
        setReg(APDS9930_ENABLE, t)
        basic.pause(3)
    }

    /**
     * Power Off
     */
    //% blockId="APDS9960_OFF" block="Power Off"
    //% weight=80 blockGap=8
    export function PowerOff() {
        let t = getReg(APDS9930_ENABLE)
        t &= 0xFE
        setReg(APDS9930_ENABLE, t)
    }

    /**
     * ALS Enable
     * @param en is enable/disable ALS, eg: true
     */
    //% blockId="APDS9960_ALS_ENABLE" block="ALS Enable %en"
    //% weight=120 blockGap=8
    export function ALSEnable(en: boolean = true) {
        let t = getReg(APDS9930_ENABLE)
        t &= 0xFD
        if (en) t |= 2
        setReg(APDS9930_ENABLE, t)
    }

    /**
     * Proximity Enable
     * @param en is enable/disable Proximity, eg: true
     */
    //% blockId="APDS9960_Proximity_ENABLE" block="Proximity Enable %en"
    //% weight=120 blockGap=8
    export function ProximityEnable(en: boolean = true) {
        let t = getReg(APDS9930_ENABLE)
        t &= 0xFB
        if (en) t |= 4
        setReg(APDS9930_ENABLE, t)
    }

    /**
     * Wait Enable
     * @param en is enable/disable wait timer, eg: true
     */
    export function WaitEnable(en: boolean = true) {
        let t = getReg(APDS9930_ENABLE)
        t &= 0xF7
        if (en) t |= 8
        setReg(APDS9930_ENABLE, t)
    }

    /**
     * get ALS
     */
    //% blockId="APDS9960_GET_ALS" block="get ALS"
    //% weight=201 blockGap=8
    export function getALS(): number {
        let Ch0 = getCH0()
        let Ch1 = getCH1()
        let ALSIT = 87 * (256 - getReg(APDS9930_ATIME)) >> 5
        let IAC = Math.max(Ch0 - Math.idiv(B * Ch1, 1000), Math.idiv(C * Ch0 - D * Ch1, 1000))
        IAC = Math.max(IAC, 0)
        let LPC = Math.idiv(GA * DF, ALSIT)
        return Math.idiv(IAC * LPC, _AGAIN)
    }

    /**
     * get Proximity
     */
    //% blockId="APDS9960_GET_Proximity" block="get Proximity"
    //% weight=200 blockGap=8
    export function getProximity(): number {
        return Math.idiv(get2Reg(APDS9930_PDATAL), _PGAIN)
    }

    /**
     * Initialize
     */
    //% blockId="APDS9960_INIT" block="APDS9930 Initialize"
    //% weight=210 blockGap=8
    export function init() {
        ATIME(256 - 8)
        setReg(APDS9930_ENABLE, 0)
        setReg(APDS9930_ATIME, 0xFF)
        setReg(APDS9930_PTIME, 0xFF)
        setReg(APDS9930_WTIME, 0xFF)
        setReg(APDS9930_PERS, 0x22)
        setReg(APDS9930_CONFIG, 0)
        setReg(APDS9930_PPULSE, 8)
        setReg(APDS9930_CONTROL, 0x2C)
        ALSEnable()
        PowerOn()
    }

}
