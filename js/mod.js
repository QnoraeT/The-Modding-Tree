let modInfo = {
	name: "The TearonQ (i have no creative names0",
	id: "tearonq_another_game_lmao",
	author: "TearonQ",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints()) { return new Decimal(0) }
	let gain = new Decimal(1)
	gain = gain.mul(tmp.p.buyables[11].effect)
	if (!inChallenge('p', 13)) gain = gain.mul(tmp.p.effect)
	gain = gain.mul(tmp.p.buyables[22].effect.pps)
	gain = gain.pow(tmp.p.buyables[14].effect)
	if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(7)) { gain = gain.root(2) }
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	bestPoints: D(0),
	calcPointGen: D(0),
	timeSpeed: D(1),
	setTimeSpeed: D(1), // ppl who want to change time speed for themselves, go ahead :3
	globalTS: D(1)
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal(Infinity))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return 3600 // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

let controlDown = false
let shiftDown = false

window.addEventListener('keydown', function(event) {
	code = event.keyCode
	if (player.toggleKeys) {
		if (code == 16) shiftDown = !shiftDown;
		if (code == 17) controlDown = !controlDown;
	} else {
		if (code == 16) shiftDown = true;
		if (code == 17) controlDown = true;
	}
	if ((code >= 65 && code <= 90) || code == 32) {
		player.lastLettersPressed.push(getLetterFromNum(code))
		let l = player.lastLettersPressed.length
		if (l > 25) {
			player.lastLettersPressed = player.lastLettersPressed.slice(l-25,)
		}
	}
	//65 to 90 are a to z
}, false);

window.addEventListener('keyup', function(event) {
	if (player != undefined && player.toggleKeys) return 
	if (event.keyCode == 16) shiftDown = false;
	if (event.keyCode == 17) controlDown = false;
}, false);

function toggleShift(){
	shiftDown = !shiftDown
}

function toggleControl(){
	controlDown = !controlDown
}