let PAUSE_EVERYTHING = 20

let modInfo = {
    name: "TearonQ's tree",
    id: "tearonq_another_game_lmao",
    author: "TearonQ",
    pointsName: "points",
    modFiles: ["layers/alternate.js", "layers/rebirth.js", "layers/luck.js", "layers/quaternions.js", "layers/prestige.js", "tree.js"],

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

let winText = `You win, I guess, try to get eee10 i dare you >:3`

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
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 50 NaN`)
        }
        
        gain = gain.mul(tmp.p.buyables[22].effect.pps)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 55 NaN`)
        }
        gain = gain.mul(tmp.p.sspEff)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 59 NaN`)
        }
        if (hasUpgrade('p', 42)) {
            gain = gain.mul(upgradeEffect('p', 42))
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 64 NaN`)
            }
        }
        if (hasUpgrade('p', 221)) {
            gain = gain.mul(upgradeEffect('p', 221))
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 70 NaN`)
            }
        }
        if (hasUpgrade('p', 224)) {
            gain = gain.mul(upgradeEffect('p', 224))
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 76 NaN`)
            }
        }
        if (hasUpgrade('p', 402)) {
            gain = gain.mul(upgradeEffect('p', 402))
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 82 NaN`)
            }
        }
        gain = gain.mul(tmp.p.bpEffect)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 87 NaN`)
        }
        if (!hasUpgrade('q', 11)) {
            gain = gain.mul(tmp.q.generationEff[0])
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 92 NaN`)
            }
        }
        gain = gain.mul(tmp.q.buyables[11].effect)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 97 NaN`)
        }
        
        gain = gain.pow(tmp.p.buyables[14].effect)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 102 NaN`)
        }
        gain = gain.pow(tmp.p.buyables[15].effect)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 106 NaN`)
        }

        if (inChallenge('a', 15)) {
            gain = gain.max(1).log10().pow(Decimal.pow(0.1, tmp.a.challenges[15].getDepths)).pow10()
        }
        gain = gain.pow(tmp.p.energyEff)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 110 NaN`)
        }
        if (inChallenge('a', 15)) {
            gain = gain.max(1).log10().root(Decimal.pow(0.1, tmp.a.challenges[15].getDepths)).pow10()
        }

        gain = gain.pow(challengeCompletions('p', 25).pow_base(1.02))
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 114 NaN`)
        }
        if (hasUpgrade('l', 11)) {
            gain = gain.pow(upgradeEffect('l', 11))
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 119 NaN`)
            }
        }
        if (hasUpgrade('q', 11)) {
            gain = gain.pow(tmp.q.generationEff[0])
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 125 NaN`)
            }
        }
        gain = gain.pow(tmp.l.petPassiveEffs.circle)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 130 NaN`)
        }
        if (player.l.petEquipped.includes('pentagon') && (inChallenge('p', 31) || inChallenge('p', 41) || hasUpgrade('q', 16))) {
            gain = gain.pow(tmp.l.petActiveEffs.pentagon.pow(
                (inChallenge('p', 31) || inChallenge('p', 41) || hasUpgrade('q', 31))
                ? 1
                : 0.5
            ))
            if (Decimal.isNaN(gain)) {
                throw new Error(`line 139 NaN`)
            }
        }
        gain = gain.pow(tmp.r.challenges[11].rewardEffect.curr)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 144 NaN`)
        }
        gain = gain.pow(tmp.a.subpointEffect)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 148 NaN`)
        }
        gain = gain.pow(tmp.r.challenges[18].rewardEffect.curr)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 152 NaN`)
        }
        gain = gain.pow(tmp.r.challenges[21].rewardEffect.curr)
        if (Decimal.isNaN(gain)) {
            throw new Error(`line 156 NaN`)
        }
    }

    if (inChallenge('a', 15)) {
        gain = gain.max(1).log10().pow(Decimal.pow(0.1, tmp.a.challenges[15].getDepths)).pow10()
    }
    
    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(7)) { 
        gain = gain.root(challengeCompletions('p', 12).sub(5))
    }
    if (inChallenge('q', 11)) {
        gain = gain.root(Decimal.pow10(tmp.q.challenges[11].getDepths))
    }

    if (inChallenge('a', 13)) {
        gain = gain.max(Decimal.layeradd10(tmp.a.challenges[13].getDepths)).layeradd10(tmp.a.challenges[13].getDepths.neg())
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
    return player.points.gte('eee1000')
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
