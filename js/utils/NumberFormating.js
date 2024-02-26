
// function exponentialFormat(num, precision, mantissa = true) {
//     let e = num.log10().floor()
//     let m = num.div(Decimal.pow(10, e))
//     if (m.toStringWithDecimalPlaces(precision) == 10) {
//         m = decimalOne
//         e = e.add(1)
//     }
//     e = (e.gte(1e9) ? format(e, 3) : (e.gte(10000) ? commaFormat(e, 0) : e.toStringWithDecimalPlaces(0)))
//     if (mantissa)
//         return m.toStringWithDecimalPlaces(precision) + "e" + e
//     else return "e" + e
// }

// function commaFormat(num, precision) {
//     if (num === null || num === undefined) return "NaN"
//     if (num.mag < 0.001) return (0).toFixed(precision)
//     let init = num.toStringWithDecimalPlaces(precision)
//     let portions = init.split(".")
//     portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
//     if (portions.length == 1) return portions[0]
//     return portions[0] + "." + portions[1]
// }


// function regularFormat(num, precision) {
//     if (num === null || num === undefined) return "NaN"
//     if (num.mag < 0.0001) return (0).toFixed(precision)
//     if (num.mag < 0.1 && precision !==0) precision = Math.max(precision, 4)
//     return num.toStringWithDecimalPlaces(precision)
// }

// function fixValue(x, y = 0) {
//     return x || new Decimal(y)
// }

// function sumValues(x) {
//     x = Object.values(x)
//     if (!x[0]) return decimalZero
//     return x.reduce((a, b) => Decimal.add(a, b))
// }

// function format(decimal, precision = 2, small) {
//     small = small || modInfo.allowSmall
//     decimal = new Decimal(decimal)
//     if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
//         player.hasNaN = true;
//         return "NaN"
//     }
//     if (decimal.sign < 0) return "-" + format(decimal.neg(), precision, small)
//     if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
//     if (decimal.gte("eeee1000")) {
//         var slog = decimal.slog()
//         if (slog.gte(1e6)) return "F" + format(slog.floor())
//         else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
//     }
//     else if (decimal.gte("1e1000000")) return exponentialFormat(decimal, 0, false)
//     else if (decimal.gte("1e10000")) return exponentialFormat(decimal, 0)
//     else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
//     else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
//     else if (decimal.gte(0.0001) || !small) return regularFormat(decimal, precision)
//     else if (decimal.eq(0)) return (0).toFixed(precision)

//     decimal = invertOOM(decimal)
//     let val = ""
//     if (decimal.lt("1e1000")){
//         val = exponentialFormat(decimal, precision)
//         return val.replace(/([^(?:e|F)]*)$/, '-$1')
//     } else return format(decimal, precision) + "⁻¹"
// }

// function formatWhole(decimal) {
//     decimal = new Decimal(decimal)
//     if (decimal.gte(1e9)) return format(decimal, 2)
//     if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2)
//     return format(decimal, 0)
// }

// function formatTime(s) {
//     if (s < 60) return format(s) + "s"
//     else if (s < 3600) return formatWhole(Math.floor(s / 60)) + "m " + format(s % 60) + "s"
//     else if (s < 86400) return formatWhole(Math.floor(s / 3600)) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
//     else if (s < 31536000) return formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
//     else return formatWhole(Math.floor(s / 31536000)) + "y " + formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
// }

// function toPlaces(x, precision, maxAccepted) {
//     x = new Decimal(x)
//     let result = x.toStringWithDecimalPlaces(precision)
//     if (new Decimal(result).gte(maxAccepted)) {
//         result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
//     }
//     return result
// }

// // Will also display very small numbers
// function formatSmall(x, precision=2) { 
//     return format(x, precision, true)    
// }

// function invertOOM(x){
//     let e = x.log10().ceil()
//     let m = x.div(Decimal.pow(10, e))
//     e = e.neg()
//     x = new Decimal(10).pow(e).times(m)

//     return x
// }

"use strict";

const abbSuffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
                    "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"];


const timeList = [
    { name: "pt",  stop: true,  amt: 5.39e-44    },
    { name: "qs",  stop: true,  amt: 1 / 1e30    },
    { name: "rs",  stop: true,  amt: 1 / 1e27    },
    { name: "ys",  stop: true,  amt: 1 / 1e24    },
    { name: "zs",  stop: true,  amt: 1 / 1e21    },
    { name: "as",  stop: true,  amt: 1 / 1e18    },
    { name: "fs",  stop: true,  amt: 1 / 1e15    },
    { name: "ps",  stop: true,  amt: 1 / 1e12    },
    { name: "ns",  stop: true,  amt: 1 / 1e9     },
    { name: "µs",  stop: true,  amt: 1 / 1e6     },
    { name: "ms",  stop: true,  amt: 1 / 1e3     },
    { name: "s",   stop: true,  amt: 1           },
    { name: "m",   stop: false, amt: 60          },
    { name: "h",   stop: false, amt: 3600        },
    { name: "d",   stop: false, amt: 86400       },
    { name: "mo",  stop: false, amt: 2592000     },
    { name: "y",   stop: false, amt: 3.1536e7    },
    { name: "mil", stop: false, amt: 3.1536e10   },
    { name: "uni", stop: false, amt: 4.320432e17 },
];

const abbExp = 1e66;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function format(number, dec = 0, expdec = 3) {
    let n = new Decimal(number);
    if (n.lt(0)) return "-" + format(n.negate(), dec, expdec);
    if (n.eq(0)) return "0";
    if (!Number.isFinite(n.mag)) return "Infinity";
    if (Number.isNaN(n.mag)) return "NaN";
    if (n.lt(0.001)) {
        return "1 / " + format(n.recip(), dec, expdec);
    } else if (n.lt(1e6)) {
        return numberWithCommas(n.toNumber().toFixed(dec));
    } else if (n.lt(abbExp)) {
        let abb = n.log(1000).mul(1.000000001).floor();
        return n.div(Decimal.pow(1000, abb)).toNumber().toFixed(expdec) + " " + abbSuffixes[abb];
    } else if (n.lt("e1e6")) {
        let exp = n.log10().mul(1.000001).floor();
        return n.div(exp.pow10()).toNumber().toFixed(expdec) + "e" + format(exp, 0, expdec);
    } else if (n.lt("10^^7")) {
        return "e" + format(n.log10(), dec, expdec);
    } else {
        return "F" + format(n.slog(10), dec, expdec);
    }
}

function formatPerc(number, dec = 3, expdec = 3) {
    let n = new Decimal(number);
    if (n.gte(1000)) {
        return format(n, dec, expdec) + "x";
    } else {
        return format(Decimal.sub(100, Decimal.div(100, n)), dec, expdec) + "%";
    }
}

function formatTime(number, dec = 0, expdec = 3, limit = 2) {
    let n = new Decimal(number);
    if (n.lt(0)) return "-" + formatTime(n.negate(), dec, expdec);
    if (n.eq(0)) return "0";
    if (!Number.isFinite(n.mag)) return "Forever";
    if (Number.isNaN(n.mag)) return "I don't know?";
    let lim = 0;
    let str = "";
    for (let i = timeList.length - 1; i >= 0; i--) {
        if (lim >= limit) {
            break;
        }
        if (n.gte(timeList[i].amt)) {
            str = str + " " + format(n.div(timeList[i].amt), 0, expdec) + " " + timeList[i].name;
            n = n.sub(n.div(timeList[i].amt).floor().mul(timeList[i].amt));
            lim++;
            if (timeList[i].stop) {
                break;
            }
        } else {
            if (i === 0) {
                return format(n, dec, expdec) + " s";
            }
        }
    }
    return str.slice(1);
}