"use strict";

addLayer('q', {
    name: "quaternions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'Q', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 1, // Row the layer is in on the tree (0 is the first row)
	branches: ['p'],
    hotkeys: [
        {key: 'q', description: "Q: Reset for quaternions", onPress(){if (canReset('q')) doReset('q')}},
    ],
    layerShown(){ return hasUpgrade('p', 13) || Decimal.gt(player.q.best, 0) },
    startData() { return {
        unlocked: false,
        points: D(0),
        bestPointsInQ: D(0),
        timeInQ: D(0),
        // temporary
        bestTimeInQ: D(0),
        allocated: [D(0), D(0), D(0), D(0)],
        allocGen: [D(0), D(0), D(0), D(0)],
    }},
    color() {
        return gRC(player.timePlayed / 6, 1.0, 1.0)
    },
    requires: D(1e8), // Can be a function that takes requirement increases into account
    resource: "quaternions", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() { return player.p.total }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player.q.timeInQ = player.q.timeInQ.add(player.globalTS.mul(diff))
        player.q.bestTimeInQ = player.q.bestTimeInQ.add(player.globalTS.mul(diff))

        for (let i = 0; i < player.q.allocated.length; i++) {
            player.q.allocGen[i] = player.q.allocGen[i].add(tmp.q.generationGain[i].mul(player.globalTS).mul(diff))
        }

        if (hasUpgrade('q', 12)) {
            tmp.q.buyables[11].buyMax()
            tmp.q.buyables[12].buyMax()
            tmp.q.buyables[13].buyMax()
        }
    },
    effect(){
        let i = player.q.total
        i = i.mul(0.2).add(1).sqrt()
        if (hasUpgrade('p', 274)) {
            i = i.pow(1.1)
        }
        return i
    },
    effectDescription(){
        return ` multiplying prestige point gain by &times;${format(tmp.q.effect, 2)}.`
    },
    generationGain() {
        const arr = []
        for (let i = 0; i < player.q.allocated.length; i++) {
            let gen = player.q.allocated[i].pow(2).div(100)
            if (hasUpgrade('p', 263)) {
                gen = gen.add(1).pow(1.2).sub(1)
            }
            arr.push(gen)
        }
        return arr
    },
    generationEff() {
        const arr = []
        for (let i = 0; i < player.q.allocated.length; i++) {
            arr.push(D(0))
        }
        arr[0] = player.q.allocGen[0].add(1).pow(2)
        arr[1] = player.q.allocGen[1].add(1).root(5)
        arr[2] = player.q.allocGen[2].add(1)
        arr[3] = player.q.allocGen[3].add(1).root(2)

        if (challengeCompletions('q', 12).gte(1)) {
            for (let i = 0; i < player.q.allocated.length; i++) {
                arr[i] = arr[i].pow(player.q.allocated[i].max(1e10).log10().log10())
            }
        }

        if (hasUpgrade('q', 11)) {
            arr[0] = arr[0].max(10).log10().log10().div(80).add(1).pow(2)
            arr[1] = arr[1].max(10).log10().log10().div(100).add(1).pow(1.6)
            arr[2] = arr[2].max(10).log10().log10().div(120).add(1).pow(1.2)
            arr[3] = arr[3].max(10).log10().log10().div(10).add(1).pow(2.5)
        }
        
        return arr
    },
    getRequire() {
        let i = new Decimal(1e8)
        return i
    },
    canReset() {
        let req = tmp.q.getRequire
        return player.p.total.gte(req)
    },
    getResetGain() {
        let req = tmp.q.getRequire.log10()
        let i = player.p.total.lt(req) 
            ? new Decimal(0) 
            : player.p.total.max(1).log10().mul(req).sqrt().sub(req).mul(2).pow_base(2).floor()

        if (hasUpgrade('p', 274)) {
            i = i.pow(1.1)
        }
        i = i.pow(challengeCompletions('p', 25).pow_base(1.02))
        return i
    },
    getNextAt() {
        let i = tmp.q.getResetGain

        i = i.root(challengeCompletions('p', 25).pow_base(1.02))
        if (hasUpgrade('p', 274)) {
            i = i.root(1.1)
        }

        let req = tmp.q.getRequire.log10()
        i = i.add(1).floor().log2().div(2).add(req).pow(2).div(req).pow10()
        return i
    },
    prestigeButtonText(){
        let gain = tmp.q.getResetGain
        let nextAt = tmp.q.getNextAt

        let amt = "You can reset for " + format(gain) + " Quaternions"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Prestige Points for the next"

        return amt + nxt
    },
    doReset(isInside) {
        tmp.p.doReset()

        player.q.timeInQ = D(0)

        player.points = D(0)
        player.p.bestPointsInP = D(0)

        player.p.points = D(0)
        player.p.best = D(0)
        player.p.total = D(0)

        player.p.essence = D(0)
        player.p.bestEssence = D(0)

        setBuyableAmount('p', 11, D(0))
        setBuyableAmount('p', 12, D(0))
        setBuyableAmount('p', 13, D(0))
        setBuyableAmount('p', 14, D(0))
        setBuyableAmount('p', 21, D(0))
        setBuyableAmount('p', 22, D(0))
        setBuyableAmount('p', 23, D(0))
        setBuyableAmount('p', 31, D(0))
        setBuyableAmount('p', 32, D(0))
        setBuyableAmount('p', 33, D(0))
        setBuyableAmount('p', 41, D(0))
        setBuyableAmount('p', 42, D(0))
        setBuyableAmount('p', 43, D(0))

        if (!isInside) {
            this.resetSpecialData()
        }
        
        player.p.ssChalBest = D(1e5)
        player.p.ssPoints = D(0)
        player.p.ssTotal = D(0)

        player.p.challenges[13] = D(0)
        if (!hasMilestone('q', 9)) {
            player.p.challenges[11] = D(0)
            player.p.challenges[12] = D(0)
            player.p.challenges[14] = D(0)
        }
        
        if (!hasMilestone('q', 8)) {
            player.p.upgrades = []
            if (hasMilestone('q', 0)) {
                player.p.upgrades.push(21)
            }
            if (hasMilestone('q', 1)) {
                player.p.upgrades.push(22)
            }
            if (hasMilestone('q', 2)) {
                player.p.upgrades.push(23)
            }
        }
    },
    resetSpecialData() {
        // chal 3
        player.p.treePoints = D(0)
        player.p.branchPoints = D(0)
        player.p.upg412BP = D(0)
        setBuyableAmount('p', 71, D(0))
        setBuyableAmount('p', 72, D(0))
        setBuyableAmount('p', 73, D(0))
        
        const SAFE_UPGRADES = [11, 12, 13, 14, 15, 21, 22, 23, 24, 31, 41, 42, 43, 44, 45]
        if (challengeCompletions('q', 14).gte(1)) {
            SAFE_UPGRADES.push(421, 422, 423, 424, 425)
        }
        
        player.p.upgrades = player.p.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
        player.p.totalBPUsed = D(0)
        
        setBuyableAmount('p', 15, D(0))
        player.p.challenge21Clicks = D(0)
        player.p.challenge21ClicksRemain = D(200)
        player.p.challenge22Unlocks = []
        
        player.p.hsPoints = D(0)
        player.p.hsTotal = D(0)
        player.p.hsBest = D(0)
        player.p.hsBestGalaxies = D(0)
        player.p.hsChalBest = inChallenge('q', 13) ? D('e3000') : D('e3e5')
        setBuyableAmount('p', 81, D(0))
        setBuyableAmount('p', 82, D(0))
        setBuyableAmount('p', 83, D(0))

        player.p.challenges[21] = D(0)
        player.p.challenges[22] = D(0)
        player.p.challenges[23] = D(0)
        player.p.challenges[24] = D(0)
        player.p.challenges[25] = D(0)
        
        // chal 2
        for (let i = 0; i < 8; i++) {
            player.p.dimensionAccu[i] = D(0)
            setBuyableAmount('p', 61 + i, D(0))
        }
        player.p.energy = D(0)
        player.p.totalEnergy = D(0)
        player.p.enhancer = D(0)
        setBuyableAmount('p', 69, D(0))

        // chal 1
        setBuyableAmount('p', 51, D(0))
        setBuyableAmount('p', 52, D(0))

        player.p.milestones = []
    },
    clickables: (() => {
        const obj = {}
        for (let i = 0; i < 4; i++) {
            obj[i + 11] = {
                title: ["+1", "+i", "+j", "+k"][i],
                display() {
                    return `Currently: ${format(player.q.allocated[i])}${["", "i", "j", "k"][i]}`
                },
                canClick() {
                    return player.q.points.gte(1)
                },
                onClick() {
                    player.q.points = player.q.points.sub(1)
                    player.q.allocated[i] = player.q.allocated[i].add(1)
                }
            }
            obj[i + 21] = {
                title: ["+10%", "+10% i", "+10% j", "+10% k"][i],
                display() {
                    return `Currently: ${format(player.q.allocated[i])}${["", "i", "j", "k"][i]}`
                },
                canClick() {
                    return player.q.points.gte(1)
                },
                onClick() {
                    let used = player.q.points.mul(0.1).ceil()
                    player.q.allocated[i] = player.q.allocated[i].add(used)
                    if (player.q.points.lt('ee12')) {
                        player.q.points = player.q.points.sub(used)
                    }
                }
            }
            obj[i + 31] = {
                title: ["+All", "+All i", "+All j", "+All k"][i],
                display() {
                    return `Currently: ${format(player.q.allocated[i])}${["", "i", "j", "k"][i]}`
                },
                canClick() {
                    return player.q.points.gte(1)
                },
                onClick() {
                    player.q.allocated[i] = player.q.allocated[i].add(player.q.points)
                    player.q.points = D(0)
                }
            }
        }
        return obj
    })(),
    milestones: {
        0: {
            requirementDescription: "2 total quaternions",
            effectDescription: "Keep PB1 autobuyer.",
            done() { return player.q.total.gte(2) }
        },
        1: {
            requirementDescription: "3 total quaternions",
            effectDescription: "Keep PB2 autobuyer.",
            done() { return player.q.total.gte(3) },
            unlocked() { return hasMilestone('q', 0) }
        },
        2: {
            requirementDescription: "5 total quaternions",
            effectDescription: "Keep PB3 autobuyer.",
            done() { return player.q.total.gte(5) },
            unlocked() { return hasMilestone('q', 1) }
        },
        3: {
            requirementDescription: "10 total quaternions",
            effectDescription: "PPB1-3 are autobought.",
            done() { return player.q.total.gte(10) },
            unlocked() { return hasMilestone('q', 2) }
        },
        4: {
            requirementDescription: "100 total quaternions",
            effectDescription: "PPB4-6 are autobought.",
            done() { return player.q.total.gte(100) },
            unlocked() { return hasMilestone('q', 3) }
        },
        5: {
            requirementDescription: "1,000 total quaternions",
            effectDescription: "PPB7-9 are autobought.",
            done() { return player.q.total.gte(1000) },
            unlocked() { return hasMilestone('q', 4) }
        },
        6: {
            requirementDescription: "10,000 total quaternions",
            effectDescription: "Gain 1% of PP gained every second.",
            done() { return player.q.total.gte(10000) },
            unlocked() { return hasMilestone('q', 5) }
        },
        7: {
            requirementDescription: "1,000,000 total quaternions",
            effectDescription: "Unlock new quaternion challenges.",
            done() { return player.q.total.gte(1e6) },
            unlocked() { return hasMilestone('q', 6) }
        },
        8: {
            requirementDescription: "100.000 M total quaternions",
            effectDescription: "Keep all PP Upgrades.",
            done() { return player.q.total.gte(1e8) },
            unlocked() { return hasMilestone('q', 7) }
        },
        9: {
            requirementDescription: "10.000 B total quaternions",
            effectDescription: "Keep PP Challenges 1, 2, and 4.",
            done() { return player.q.total.gte(1e10) },
            unlocked() { return hasMilestone('q', 8) }
        },
        10: {
            requirementDescription: "1.000 Sp total quaternions",
            effectDescription: "PP Challenge 4 can be bulk-completed.",
            done() { return player.q.total.gte(1e24) },
            unlocked() { return hasMilestone('q', 9) }
        },
    },
    challenges: {
        11: {
            unlocked: true,
            name: "Rank Loss",
            challengeDescription: "Point gain is reduced by ^0.1, and PB4's effect past ^2 is softcapped. While in this challenge, Ranks and Tiers are unlocked.",
            goalDescription: `Get ${format(1e300)} Points.`,
            canComplete() { return player.points.gte(1e300) },
            rewardDescription: `Point Buyable 1 scales 25.000% slower. Unlock a few more prestige upgrades and quaternion buyables.`,
            getDepths() {
                let i = inChallenge('q', 11, true) ? D(1) : D(0)

                if (inChallenge('q', 14)) {
                    i = i.add(tmp.q.challenges[14].getDepths)
                }

                return i
            },
            onEnter() {
                tmp.q.doReset(false)
                updateTemp()
            },
            onExit() {
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
            }
        },
        12: {
            unlocked() { return challengeCompletions('q', 11).gte(1) },
            name: "Dimension Loss",
            challengeDescription: "Point Buyable #1 is disabled. While in this challenge, Prestige Dimensions are unlocked.",
            goalDescription: `Get ${format('e4000')} Points.`,
            canComplete() { return player.points.gte('e4000') },
            rewardDescription: `Point Buyable 3 scales 10.000% slower. Total allocated quaternions boost their respective effect. Reunlock Ranks and Tiers and they do not reset upon Quaternions, but they are weaker outside of Rank Loss.`,
            getDepths() {
                let i = inChallenge('q', 12, true) ? D(1) : D(0)

                if (inChallenge('q', 14)) {
                    i = i.add(tmp.q.challenges[14].getDepths)
                }

                return i
            },
            onEnter() {
                tmp.q.doReset(false)
                updateTemp()
            },
            onExit() {
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
            }
        },
        13: {
            unlocked() { return challengeCompletions('q', 12).gte(1) },
            name: "Tree Loss",
            challengeDescription: "You are stuck in Super Scaling and Crippled Points. Point's third softcap is in effect at e1,000,000. While in this challenge, Trees are unlocked.",
            goalDescription: `Get ${format('e4e6')} Points.`,
            canComplete() { return player.points.gte('e4e6') },
            rewardDescription: `PP Buyables add 0.01 free levels above and to the left (9 adds levels to 8 & 6, etc). Reunlock Dimensions and they do not reset upon Quaternions, but they are weaker outside of Dimension Loss.`,
            getDepths() {
                let i = inChallenge('q', 13, true) ? D(1) : D(0)

                if (inChallenge('q', 14)) {
                    i = i.add(tmp.q.challenges[14].getDepths)
                }

                return i
            },
            onEnter() {
                tmp.q.doReset(false)
                updateTemp()
            },
            onExit() {
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
            }
        },
        14: {
            unlocked() { return challengeCompletions('q', 13).gte(1) },
            name: "Full Loss",
            challengeDescription: "All prior challenges combined with several changes. This challenge is overall faster. Hardcaps at e20.000 B points.",
            goalDescription: `Get ${format('e2e10')} Points.`,
            canComplete() { return player.points.gte('e2e10') },
            rewardDescription: `Unlock a new layer above and aside from this. Reunlock Trees and they do not reset upon Quaternions, but they are weaker outside of Dimension Loss. The final 5 Hyper Scaling upgrades are kept.`,
            getDepths() {
                let i = inChallenge('q', 14, true) ? D(1) : D(0)
                return i
            },
            onEnter() {
                tmp.q.doReset(false)
                updateTemp()
            },
            onExit() {
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
                tmp.q.doReset(false)
                updateTemp()
            }
        }
    },
    buyables: (() => {
        const upgrades = {
            11: {
                type: 0,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(1e12), D(5), D(1.04)]}

                    return obj
                },
                unlocked() { return challengeCompletions('q', 11).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        if (hasUpgrade('p', 284)) {
                            i = i.add(player.q.buyables[12])
                        }
                        if (hasUpgrade('p', 253)) { i = i.mul(1.05) }
                    }

                    j = D(1e200)

                    i = Decimal.pow(j, i.pow(1.2))
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.q.buyables[11])
                    return `&times;${format(currEffect)} point gain.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.q.buyables[11])
                    const nextEffect = this.effect(player.q.buyables[11].add(1))
                    return `&times;${format(nextEffect.div(currEffect), 2)} point gain.` 
                },
                scaleModifEffective(x) {
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            12: {
                type: 0,
                num: 2,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(2e15), D(20), D(1.2)]}

                    return obj
                },
                unlocked() { return challengeCompletions('q', 11).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        if (hasUpgrade('p', 284)) {
                            i = i.add(player.q.buyables[13])
                        }
                        if (hasUpgrade('p', 253)) { i = i.mul(1.05) }
                    }

                    j = D(100)

                    i = Decimal.pow(j, i.pow(1.1))
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.q.buyables[12])
                    return `&times;${format(currEffect)} prestige point gain.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.q.buyables[12])
                    const nextEffect = this.effect(player.q.buyables[12].add(1))
                    return `&times;${format(nextEffect.div(currEffect), 2)} prestige point gain.` 
                },
                scaleModifEffective(x) {
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            13: {
                type: 0,
                num: 3,
                get costD() {
                    const obj = {type: 1, exp: 1, main: [D(19), D(1.09), D(1.2)]}

                    return obj
                },
                unlocked() { return challengeCompletions('q', 11).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        if (hasUpgrade('p', 253)) { i = i.mul(1.05) }
                    }

                    j = D(1.05)

                    i = Decimal.pow(j, i)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.q.buyables[13])
                    return `^${format(currEffect, 3)} Point Buyable 2 effect.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.q.buyables[13])
                    const nextEffect = this.effect(player.q.buyables[13].add(1))
                    return `^${format(nextEffect.div(currEffect), 3)} Point Buyable 2 effect.` 
                },
                scaleModifEffective(x) {
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
        };

        // ! NOTE!! 'q' doesn't work in the custom buyable script TwT

        for (const upgrade of Object.values(upgrades)) {
            upgrade.effect = (x) => {
                if (upgrade.unavail()) { 
                    return upgrade.preEffect(D(0), true)
                }
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected as input in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }

                let eff = upgrade.preEffect(D(x), false)
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected as effect in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }
                return eff
            }

            upgrade.cost = (x) => {
                if (upgrade.unavail()) { return D(Infinity) }
                let i, j, k;
                j = x
                k = upgrade.costD.main

                j = upgrade.scaleModifEffective(j)
                if (upgrade.costD.type === 0) {
                    i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);
                } else if (upgrade.costD.type === 1) {
                    i = Decimal.pow(k[1], j.pow(k[2])).mul(k[0]);
                }

                i = i.layeradd10(upgrade.costD.exp)
                i = upgrade.scaleModifCost(i)
                return i
            }

            upgrade.target = () => {
                if (upgrade.unavail()) { return D(-1e-12) }

                if (upgrade.type === 0) {
                    x = player.q.points;
                }
                
                if (x.lt(upgrade.costD.main[0])) { return D(-1e-12) }

                let i, j;
                i = D(x)
                j = upgrade.costD.main
                if (Decimal.isNaN(i)) {
                    throw new Error(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected in target resource!`)
                }
                i = upgrade.scaleModifTarCost(i)

                if (Decimal.isNaN(i)) {
                    console.info(`PROBLEM FUNCTION:`)
                    console.info(upgrade.scaleModifTarCost)
                    throw new Error(`[Layer: q, Type: buyable, ID: ${upgrade.id}]NaN detected in target of id${upgrade.id} after modifier target cost!`)
                }
                i = i.layeradd10(-upgrade.costD.exp)

                if (Decimal.isNaN(i)) {
                    // it's likely only NaN because the value is too low and the amount of logs would make it NaN
                    // or something earlier up has caused crap to happen, make it default into a 0 value
                    console.warn(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} before scaling!`)
                    return D(0)
                }

                // currency less than base cost, we don't need to do anything except for accounting for possible free levels via cost reduction
                if (i.lt(j[0])) {
                    i = D(0)
                } else {
                    if (upgrade.costD.type === 0) {
                        j = upgrade.costD.main.map((x) => Decimal.log10(x));
                        if (j[2].eq(0)) { 
                            i = i.log10().sub(j[0]).div(j[1]);
                        } else {
                            i = i.log10().sub(j[0]).mul(j[2]).mul(4).add(j[1].pow(2)).sqrt().sub(j[1]).div(j[2]).div(2);
                        }
                    } else if (upgrade.costD.type === 1) {
                        j = upgrade.costD.main
                        i = i.div(j[0]).log(j[1]).root(j[2]);
                    }
                }

                if (Decimal.isNaN(i)) {
                    // no clue what's happening
                    console.warn(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after main scaling! (main scaling causing NaN?)`)
                    return D(0)
                }

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after modifers before scaleModifTarEff! (modifiers causing NaN?)`)
                    return D(0)
                }

                i = upgrade.scaleModifTarEff(i)

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: q, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after scaleModifTarEff! (scaleModifTarEff causing NaN?)`)
                    return D(0)
                }
                return i
            }

            upgrade.title = () => { 
                if (upgrade.type === 0) {
                    return `Quaternion Buyable ${upgrade.num}` 
                }
            },

            upgrade.stupidHack = () => {
                return shiftDown
            }

            upgrade.display = () => {
                // console.log(`%cbuyable id ${upgrade.id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
                let txt;
                txt = `You have ${format(player.q.buyables[upgrade.id], 0)} ${["Quaternion"][upgrade.type]} Buyable ${upgrade.num}.<br>`
                if (upgrade.stupidHack()) {
                    txt += `Effect Base: `
                    txt += upgrade.dispEffBase()
                    txt += `<br>Cost Formula: ` 
                    if (upgrade.costD.exp >= 1) { 
                        for (let i = 0; i < upgrade.costD.exp; i++) {
                            txt += `10<sup>` 
                        }
                    }
                    if (upgrade.costD.type === 0) {
                        txt += `${format(upgrade.costD.main[0])} × ${format(upgrade.costD.main[1], 2)}<sup>n</sup> × ${format(upgrade.costD.main[2], 3)}<sup>n<sup>2</sup></sup>`
                    } else if (upgrade.costD.type === 1) {
                        txt += `${format(upgrade.costD.main[0])} × ${format(upgrade.costD.main[1], 2)}<sup>n<sup>${format(upgrade.costD.main[2], 3)}</sup></sup>`
                    }
                    if (upgrade.costD.exp >= 1) { 
                        for (let i = 0; i < upgrade.costD.exp; i++) {
                            txt += `</sup>` 
                        }
                    }
                } else {
                    txt += `Effect: `
                    txt += upgrade.dispEffect() 
                    txt += `<br>Cost: ${format(upgrade.cost())} `
                    if (upgrade.type === 0) {
                        txt += `Quaternions`
                    }
                }
                return txt
            }
            upgrade.canAfford = () => {
                let resource;
                if (upgrade.type === 0) {
                    resource = player.q.points;
                }
                return resource.gte(upgrade.cost());
            }
            upgrade.buy = () => {
                if (upgrade.type === 0) {
                    player.q.points = player.q.points.sub(upgrade.cost());
                }
                addBuyables(upgrade.layer, upgrade.id, 1);
            };
            upgrade.buyMax = () => {
                setBuyableAmount(upgrade.layer, upgrade.id, upgrade.target().add(1).floor().max(player.q.buyables[upgrade.id]))
            }
        }
        return upgrades;
    })(),
    upgrades: {
        11: {
            title: "It's about time that this is useful.",
            description: "Quaternion Energy now raises the resources it affects.",
            cost: new Decimal('e5e15'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        12: {
            title: "Get this out of the way.",
            description: "Automate Quaternion Buyables 1-3 and Point Buyable 5.",
            cost: new Decimal('ee17'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        13: {
            title: "Pet Boost",
            description: "You can equip 1 more pet and every quaternion upgrade increases pet gain by 2.5&times;.",
            cost: new Decimal('e2e17'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
            effect() { 
                let ret = Decimal.pow(2.5, player.q.upgrades.length)
                return ret;
            },
            effectDisplay() { return `&times${format(this.effect(), 1)}` }, 
        },
        14: {
            title: "Lucky Pets",
            description: "Automate Luck Dimensions, Luck Energy's effects are improved, and also boost pet luck.",
            cost: new Decimal('ee18'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
            effect() { 
                let ret = player.l.energy.max('e1000').log10().log(1000)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)} to pet luck` }, 
        },
        15: {
            title: "Dimension Hopper",
            description: "(everything beyond is unimplemented lol) Luck Essence raises prestige dimension multipliers at a reduced rate.",
            cost: new Decimal('ee19'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
            effect() { 
                let ret = player.l.points.max(1).log10().div(2).add(1)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)}` }, 
        },
        16: {
            title: "No more of that,",
            description: "Gain Super Scaling Points as if you were in the challenge without the debuffs. Point gain from Pentagon applies at ^0.5 rate outside of Super Scaling.",
            cost: new Decimal('ee20'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        17: {
            title: "... and no more of that.",
            description: "Buyable 5 clicks never reset. Quaternions are auto-generated at 100% rate and are auto-allocated. Charges increase multiplicatively instead of additively.",
            cost: new Decimal('e2e20'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        21: {
            title: "Chip it away",
            description: "PP Buyables 2 and 3's exponential scaling is reduced by 4% per quaternion upgrade past the 1st row.",
            cost: new Decimal('ee22'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
            effect() { 
                // add 1 if the upg is id >21
                let ret = player.q.upgrades.reduce((total, upg) => { return total + (upg >= 21 ? 1 : 0); }, 0)
                ret = Decimal.pow(1.04, ret)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 2)}` }, 
        },
        22: {
            title: "Oh, this too",
            description: "Hyper Scaling intervals are reduced by ^0.95 per quaternion upgrade on this or after this.",
            cost: new Decimal('ee23'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
            effect() { 
                // add 1 if the upg is id >22
                let ret = player.q.upgrades.reduce((total, upg) => { return total + (upg >= 22 ? 1 : 0); }, 0)
                ret = Decimal.pow(0.95, ret)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 2)}` }, 
        },
        23: {
            title: "And this one",
            description: "Point Buyable 4's exponential scaling is reduced by 2% per quaternion upgrade on this or after this.",
            cost: new Decimal('ee24'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
            effect() { 
                // add 1 if the upg is id >23
                let ret = player.q.upgrades.reduce((total, upg) => { return total + (upg >= 23 ? 1 : 0); }, 0)
                ret = Decimal.pow(1.02, ret)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 2)}` }, 
        },
        24: {
            title: "Oh, I forgot to automate this",
            description: "Crippled Points challenge now auto-completes outside of the challenge. The u8-2 tree upgrade is also squared.",
            cost: new Decimal('ee25'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        25: {
            title: "Maybe a few simple ones?",
            description: "Luck is raised ^1.1",
            cost: new Decimal('ee26'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        26: {
            title: "Just one more simple one",
            description() {
                return hasUpgrade('q', 26)
                    ? "Wait fuck, I forgot to specify, now every Buyable 5's effect is raised ^1.1"
                    : "Buyable 5's effect is raised ^1.1"
            },
            cost: new Decimal('ee27'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
        27: {
            title: "Luck Buyable 3 didn't need to have this scaling",
            description: "Remove Luck Buyable 3's *quadratic* scaling",
            cost: new Decimal('ee28'),
            unlocked() { return challengeCompletions('p', 12).gte(20) },
        },
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button", ""],
                ["display-text",
                function() { return `You have ${format(player.p.total)} total prestige points.` }],
                "blank",
                ["clickables", [1, 2, 3]],
                "blank",
                ["display-text",
                function() { return `<span style="color: #ff8080">Your <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(player.q.allocated[0])}</h2>&times;[1] is generating <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(tmp.q.generationGain[0], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #ff8080">You have <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(player.q.allocGen[0], 2)}</h2> red charge, which is boosting point gain by ${hasUpgrade('q', 11) ? '^' : '&times;'}<h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(tmp.q.generationEff[0], 2)}</h2>.</span>` }],
                "blank",
                ["display-text",
                function() { return `<span style="color: #ffff80">Your <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(player.q.allocated[1])}</h2>&times;[i] is generating <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(tmp.q.generationGain[1], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #ffff80">You have <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(player.q.allocGen[1], 2)}</h2> yellow charge, which is boosting prestige point gain by ${hasUpgrade('q', 11) ? '^' : '&times;'}<h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(tmp.q.generationEff[1], 2)}</h2>.</span>` }],
                "blank",
                ["display-text",
                function() { return `<span style="color: #80ff80">Your <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(player.q.allocated[2])}</h2>&times;[j] is generating <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(tmp.q.generationGain[2], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #80ff80">You have <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(player.q.allocGen[2], 2)}</h2> green charge, which is boosting prestige essence by ${hasUpgrade('q', 11) ? '^' : '&times;'}<h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(tmp.q.generationEff[2], 2)}</h2>.</span>` }],
                "blank",
                ["display-text",
                function() { return `<span style="color: #8080ff">Your <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(player.q.allocated[3])}</h2>&times;[k] is generating <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(tmp.q.generationGain[3], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #8080ff">You have <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(player.q.allocGen[3], 2)}</h2> blue charge, which is boosting super scaling points by ${hasUpgrade('q', 11) ? '^' : '&times;'}<h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(tmp.q.generationEff[3], 2)}</h2>.</span>` }],
            ],
            unlocked(){
                return true
            },
        },
        "Milestones": {
            content: [
                "main-display",
                ["prestige-button", ""],
                ["display-text",
                function() { return `You have ${format(player.p.total)} total prestige points.` }],
                ["display-text",
                function() { return `You have ${format(player.q.total)} total quaternions.` }],
                "blank",
                ["milestones", [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]],
            ],
            unlocked(){
                return true
            },
        },
        "Buyables": {
            content: [
                "main-display",
                ["prestige-button", ""],
                ["display-text",
                function() { return `You have ${format(player.p.total)} total prestige points.` }],
                "blank",
                ["buyables", [1]],
            ],
            unlocked(){
                // for some reason 'q' turns into undefined
                return challengeCompletions('q', 11).gte(1)
            },
        },
        "Upgrades": {
            content: [
                "main-display",
                ["prestige-button", ""],
                ["display-text",
                function() { return `You have ${format(player.p.total)} total prestige points.` }],
                "blank",
                ["upgrades", [1, 2]],
            ],
            unlocked(){
                return challengeCompletions('p', 12).gte(20)
            },
        },
        "Challenges": {
            content: [
                "main-display",
                ["prestige-button", ""],
                ["display-text",
                function() { return `You have ${format(player.p.total)} total prestige points.` }],
                "blank",
                ["display-text",
                function() { return `Warning: All in-challenge features are reset upon entering or exiting a quaternion challenge!` }],
                "blank",
                ["challenges", [1]],
            ],
            unlocked(){
                // for some reason 'q' turns into undefined
                return hasMilestone('q', 7)
            },
        },
    },
})