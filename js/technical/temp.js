var tmp = {}
var temp = tmp // Proxy for tmp
var funcs = {}
var NaNalert = false;

// Tmp will not call these
var activeFunctions = [
	"startData", "onPrestige", "doReset", "update", "automate",
	"buy", "buyMax", "respec", "onPress", "onClick", "onHold", "masterButtonPress",
	"sellOne", "sellAll", "pay", "actualCostFunction", "actualEffectFunction",
	"effectDescription", "display", "fullDisplay", "effectDisplay", "rewardDisplay",
	"tabFormat", "content",
	"onComplete", "onPurchase", "onEnter", "onExit", "done",
	"getUnlocked", "getStyle", "getCanClick", "getTitle", "getDisplay"
]

var noCall = doNotCallTheseFunctionsEveryTick
for (item in noCall) {
	activeFunctions.push(noCall[item])
}

// Add the names of classes to traverse
var traversableClasses = []

function setupTemp() {
	tmp = {}
	tmp.pointGen = {}
	tmp.backgroundStyle = {}
	tmp.displayThings = []
	tmp.scrolled = 0
	tmp.gameEnded = false
	funcs = {}
	
	setupTempData(layers, tmp, funcs)
	for (layer in layers){
		tmp[layer].resetGain = {}
		tmp[layer].nextAt = {}
		tmp[layer].nextAtDisp = {}
		tmp[layer].canReset = {}
		tmp[layer].notify = {}
		tmp[layer].prestigeNotify = {}
		tmp[layer].computedNodeStyle = []
		setupBuyables(layer)
		tmp[layer].trueGlowColor = []
	}

	tmp.other = {
		lastPoints: player.points || decimalZero,
		oomps: decimalZero,
		screenWidth: 0,
		screenHeight: 0,
    }

	updateWidth()

	temp = tmp
}

const boolNames = ["unlocked", "deactivated"]

function setupTempData(layerData, tmpData, funcsData) {
	for (item in layerData){
		if (layerData[item] == null) {
			tmpData[item] = null
		}
		else if (layerData[item] instanceof Decimal)
			tmpData[item] = layerData[item]
		else if (Array.isArray(layerData[item])) {
			tmpData[item] = []
			funcsData[item] = []
			setupTempData(layerData[item], tmpData[item], funcsData[item])
		}
		else if ((!!layerData[item]) && (layerData[item].constructor === Object)) {
			tmpData[item] = {}
			funcsData[item] = []
			setupTempData(layerData[item], tmpData[item], funcsData[item])
		}
		else if ((!!layerData[item]) && (typeof layerData[item] === "object") && traversableClasses.includes(layerData[item].constructor.name)) {
			tmpData[item] = new layerData[item].constructor()
			funcsData[item] = new layerData[item].constructor()
		}
		else if (isFunction(layerData[item]) && !activeFunctions.includes(item)){
			funcsData[item] = layerData[item]
			if (boolNames.includes(item))
				tmpData[item] = false
			else
				tmpData[item] = decimalOne // The safest thing to put probably?
		} else {
			tmpData[item] = layerData[item]
		}
	}	
}


function updateTemp() {
	if (tmp === undefined) setupTemp()

	updateTempData(layers, tmp, funcs)

	for (layer in layers){
		tmp[layer].resetGain = getResetGain(layer)
		tmp[layer].nextAt = getNextAt(layer)
		tmp[layer].nextAtDisp = getNextAt(layer, true)
		tmp[layer].canReset = canReset(layer)
		tmp[layer].trueGlowColor = tmp[layer].glowColor
		tmp[layer].notify = shouldNotify(layer)
		tmp[layer].prestigeNotify = prestigeNotify(layer)
		if (tmp[layer].passiveGeneration === true) tmp[layer].passiveGeneration = 1 // new Decimal(true) = decimalZero
	}

	tmp.pointGen = getPointGen()
	tmp.backgroundStyle = readData(backgroundStyle)

	tmp.displayThings = []
	for (thing in displayThings){
		let text = displayThings[thing]
		if (isFunction(text)) text = text()
		tmp.displayThings.push(text) 
	}
}

function updateTempData(layerData, tmpData, funcsData, useThis) {
	for (item in funcsData){
		if (Array.isArray(layerData[item])) {
			if (item !== "tabFormat" && item !== "content") // These are only updated when needed
				updateTempData(layerData[item], tmpData[item], funcsData[item], useThis)
		} else if ((!!layerData[item]) && (layerData[item].constructor === Object) || (typeof layerData[item] === "object") && traversableClasses.includes(layerData[item].constructor.name)){
			updateTempData(layerData[item], tmpData[item], funcsData[item], useThis)
		} else if (isFunction(layerData[item]) && !isFunction(tmpData[item])){
			let value
			if (useThis !== undefined) value = layerData[item].bind(useThis)()
			else value = layerData[item]()
			Vue.set(tmpData, item, value)
		}
	}	
}

function updateChallengeTemp(layer){
	updateTempData(layers[layer].challenges, tmp[layer].challenges, funcs[layer].challenges)
}


function updateBuyableTemp(layer){
	updateTempData(layers[layer].buyables, tmp[layer].buyables, funcs[layer].buyables)
}

function updateClickableTemp(layer){
	updateTempData(layers[layer].clickables, tmp[layer].clickables, funcs[layer].clickables)
}

function setupBuyables(layer) {
	for (id in layers[layer].buyables) {
		if (isPlainObject(layers[layer].buyables[id])) {
			let b = layers[layer].buyables[id]
			b.actualCostFunction = b.cost
			b.cost = function(x) {
				x = (x === undefined ? player[this.layer].buyables[this.id] : x)
				return layers[this.layer].buyables[this.id].actualCostFunction(x)
			}
			b.actualEffectFunction = b.effect
			b.effect = function(x) {
				x = (x === undefined ? player[this.layer].buyables[this.id] : x)
				return layers[this.layer].buyables[this.id].actualEffectFunction(x)
			}
		}
	}
}

function checkDecimalNaN(x) {
	return (x instanceof Decimal) && !x.eq(x)
}

/**
 * @param {Decimal} num 
 * @param {any} type 
 * @param {boolean} inverse 
 * @param {Decimal} start 
 * @param {Decimal} str 
 * @param {Decimal} powScale 
 * @returns {Decimal}
 */
function scale(num, type, inverse = false, start, str, powScale) {
    if (num.lte(start)) { return num; }
    str = Decimal.pow(powScale, str);
    switch (type) {
        // Polynomial
        case 0:
        case "P":
            return inverse
                    ? num.sub(start).mul(str).div(start).add(1).root(str).mul(start)
                    : num.div(start).pow(str).sub(1).mul(start).div(str).add(start)
        // Exponential
        case 1:
        case 1.1:
        case "E1":
            return inverse
                    ? Decimal.min(num, num.div(start).log(str).add(1).mul(start))
                    : Decimal.max(num, Decimal.pow(str, num.div(start).sub(1)).mul(start))
        case 1.2:
        case "E2":
            return inverse
                    ? num.mul(str).mul(str.ln()).div(start).lambertw().mul(start).div(str.ln())
                    : Decimal.pow(str, num.div(start).sub(1)).mul(num)
        // i gotta say, i have to give props to alemaninc for coming up with this cuz i never figured out a way to make a log cap smooth without an extreme growth difference lol
        case 1.3:
        case "E3":
            str = str.sub(1);
            return inverse
                    ? num.div(start).pow(str).sub(1).div(str).exp().mul(start)
                    : num.div(start).ln().mul(str).add(1).root(str).mul(start)
        // Semi-exponential
        case 2:
        case 2.1:
        case "SE1":
            return inverse
                    ? Decimal.pow(start, num).root(str).log(start).add(start).root(str).sub(start)
                    : Decimal.pow(start, num.log(start).pow(str)).sub(start).pow(str).add(start)
        case 2.2:
        case "SE2":
            return inverse
                    ? Decimal.pow(start, num).root(str).add(1).mul(str).sub(1).log(start)
                    : Decimal.pow(start, num.log(start).pow(str).sub(1).div(str).add(1))
        default:
            throw new Error(`Scaling type ${type} doesn't exist`);
    }
}

function gRC(time, val, sat) {
    let r = 0;
    let g = 0;
    let b = 0;
    let t = time % 1;
    let s = Math.floor(time) % 6;
    switch (s) {
        case 0:
            r = 1;
            g = t;
            break;
        case 1:
            r = 1 - t;
            g = 1;
            break;
        case 2:
            g = 1;
            b = t;
            break;
        case 3:
            g = 1 - t;
            b = 1;
            break;
        case 4:
            b = 1;
            r = t;
            break;
        case 5:
            b = 1 - t;
            r = 1;
            break;
        default:
            throw new Error("Wtf!! Why is there an invalid number?  [" + s + "]");
    }
    r = 1 - ((1 - r) * sat);
    g = 1 - ((1 - g) * sat);
    b = 1 - ((1 - b) * sat);
    r = r * val * 255;
    g = g * val * 255;
    b = b * val * 255;
    return "#" + pad(Math.round(r).toString(16), 2)
        + pad(Math.round(g).toString(16), 2)
        + pad(Math.round(b).toString(16), 2);
}

function pad(num, length) {
    while (num.length < length) {
        num = "0" + num;
    }
    return num;
}