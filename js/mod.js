let PAUSE_EVERYTHING = 20

let modInfo = {
    name: "The TearonQ (i have no creative names)",
    id: "tearonq_another_game_lmao",
    author: "TearonQ",
    pointsName: "points",
    modFiles: ["layers/luck.js", "layers/quaternions.js", "layers/prestige.js", "tree.js"],

    discordName: "My stupid fcking server",
    discordLink: "https://discord.gg/JJKRfR3gH9",
    initialStartPoints: new Decimal(10), // Used for hard resets and new players
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
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "scaleModifEffective", "scaleModifCost", "scaleModifTarEff", "scaleModifTarCost", "rollLol"]

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
    if (!(inChallenge('p', 12) && challengeCompletions('p', 12).gte(14))) {
        gain = gain.mul(tmp.p.effect)
    
        gain = gain.mul(tmp.p.buyables[22].effect.pps)
        gain = gain.mul(tmp.p.sspEff)
        if (hasUpgrade('p', 42)) {
            gain = gain.mul(upgradeEffect('p', 42))
        }
        if (hasUpgrade('p', 221)) {
            gain = gain.mul(upgradeEffect('p', 221))
        }
        if (hasUpgrade('p', 224)) {
            gain = gain.mul(upgradeEffect('p', 224))
        }
        if (hasUpgrade('p', 402)) {
            gain = gain.mul(upgradeEffect('p', 402))
        }
        gain = gain.mul(tmp.p.bpEffect)
        if (!hasUpgrade('q', 11)) {
            gain = gain.mul(tmp.q.generationEff[0])
        }
        gain = gain.mul(tmp.q.buyables[11].effect)
        
        gain = gain.pow(tmp.p.buyables[14].effect)
        gain = gain.pow(tmp.p.buyables[15].effect)
        gain = gain.pow(tmp.p.energyEff)
        gain = gain.pow(challengeCompletions('p', 25).pow_base(1.02))
        if (hasUpgrade('l', 11)) {
            gain = gain.pow(upgradeEffect('l', 11))
        }
        if (hasUpgrade('q', 11)) {
            gain = gain.pow(tmp.q.generationEff[0])
        }
        gain = gain.pow(tmp.l.petPassiveEffs.circle)
        if (player.l.petEquipped.includes('pentagon') && (inChallenge('p', 31) || inChallenge('p', 41))) {
            gain = gain.pow(tmp.l.petActiveEffs.pentagon)
        }
    }
    
    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(7)) { 
        gain = gain.root(challengeCompletions('p', 12).sub(5))
    }
    if (inChallenge('q', 11)) {
        gain = gain.root(Decimal.pow10(tmp.q.challenges[11].getDepths))
    }

    gain = gain.mul(player.globalTS)
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
