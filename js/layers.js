"use strict";

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return true },
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        bestPointsInP: D(0),
        timeInP: D(0),
        essence: D(0),
        essenceReduction: D(1),
        bestEssence: D(0),
        essencePS: D(0),
        ssChalBest: D(1e5),
        ssPoints: D(0),
        ssTotal: D(0),
        ssPPS: D(0)
    }},
    color: "#8000FF",
    requires: new Decimal(1e10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player[this.layer].timeInP = player[this.layer].timeInP.add(player.globalTS.mul(diff))

        if (hasMilestone("q", 6)) {
            let gen = tmp[this.layer].getResetGain.mul(player.globalTS).mul(diff).mul(0.01)
            player[this.layer].points = player[this.layer].points.add(gen)
            player[this.layer].total = player[this.layer].total.add(gen)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points)
        }

        if (player[this.layer].total.gte(10)) {
            let i, j = {dilate: D(1.333), exp: D(2)};
            if (hasMilestone("p", 6)) {
                j.dilate = D(1.3)
            }

            j.exp = j.exp.div(tmp[this.layer].buyables[41].effect.ess)

            i = D(3);
            i = i.add(tmp[this.layer].buyables[22].effect.exp)
            i = player[this.layer].total.add(1).mul(2).pow(i).div(Decimal.pow(2, i));
            i = i.mul(tmp[this.layer].buyables[21].effect.ppe)
            i = i.mul(tmp[this.layer].buyables[31].effect.ppe)
            i = i.mul(tmp.q.generationEff[2])
            i = i.pow(tmp[this.layer].buyables[33].effect.ppe)

            let pps = i.mul(player.globalTS).mul(diff)
            let prev = player[this.layer].essence

            player[this.layer].essenceReduction = pointGradualSoftcap(2, player[this.layer].essence.max(1), j.exp, j.dilate, false)
            if (Decimal.eq_tolerance(player[this.layer].essenceReduction, player[this.layer].essenceReduction.add(pps))) {
                player[this.layer].essenceReduction = player[this.layer].essenceReduction.div(player[this.layer].essence)
            } else {
                player[this.layer].essenceReduction = pointGradualSoftcap(2, player[this.layer].essenceReduction.add(pps.div(diff)), j.exp, j.dilate, true)
                player[this.layer].essenceReduction = player[this.layer].essenceReduction.sub(player[this.layer].essence).div(pps.div(diff)).recip()
            }

            player[this.layer].essence = player[this.layer].essence.max(1).pow(j.exp).log10().pow(j.dilate).pow10().add(pps).log10().root(j.dilate).pow10().root(j.exp);
            player[this.layer].essencePS = player[this.layer].essence.sub(prev).div(diff)
            player[this.layer].bestEssence = Decimal.max(player[this.layer].essence, player[this.layer].bestEssence);
        }

        if (inChallenge('p', 13)) {
            player[this.layer].ssChalBest = Decimal.max(player[this.layer].ssChalBest, player.points)
            if (hasUpgrade("p", 31)) {
                player[this.layer].ssPPS = player.points.max(1e5).log(1e5).pow(0.95).sub(1).pow10().pow(player[this.layer].ssChalBest.max(1e5).log(1e5))
                player[this.layer].ssPPS = player[this.layer].ssPPS.mul(tmp.q.generationEff[3])

                if (player[this.layer].ssPPS.gte(1e63)) {
                    player[this.layer].ssPPS = player[this.layer].ssPPS.log10().div(63).sqrt().sub(1).mul(2).add(1).mul(63).pow10()
                }

                player[this.layer].ssPPS = player[this.layer].ssPPS.mul(player.globalTS)

                player[this.layer].ssPoints = player[this.layer].ssPoints.add(player[this.layer].ssPPS.mul(diff))
                player[this.layer].ssTotal = player[this.layer].ssTotal.add(player[this.layer].ssPPS.mul(diff))
            }
        }

        if (hasUpgrade("p", 21)) {
            tmp[this.layer].buyables[11].buyMax()
        }

        if (hasUpgrade("p", 22)) {
            tmp[this.layer].buyables[12].buyMax()
        }

        if (hasUpgrade("p", 23)) {
            tmp[this.layer].buyables[13].buyMax()
        }
        
        if (hasMilestone("q", 3)) {
            tmp[this.layer].buyables[21].buyMax()
            tmp[this.layer].buyables[22].buyMax()
            tmp[this.layer].buyables[23].buyMax()
        }
        
        if (hasMilestone("q", 4)) {
            tmp[this.layer].buyables[31].buyMax()
            tmp[this.layer].buyables[32].buyMax()
            tmp[this.layer].buyables[33].buyMax()
        }
        
        if (hasMilestone("q", 5)) {
            tmp[this.layer].buyables[41].buyMax()
            tmp[this.layer].buyables[42].buyMax()
            tmp[this.layer].buyables[43].buyMax()
        }
    },
    effect(){
        let i = player[this.layer].total
        let j = D(3)
        j = j.add(tmp[this.layer].buyables[41].effect.ppss)
        if (hasMilestone("p", 3)) {
            j = j.add(player[this.layer].buyables[51].sub(3).mul(5))
        }

        i = i.max(0).add(1).log10().add(1).pow(0.6).sub(1).pow10().pow(j)
        return i
    },
    effectDescription(){
        return ` multiplying point gain by &times;${format(tmp[this.layer].effect, 2)}.`
    },
    sspEff() {
        let i = player[this.layer].ssTotal
        let j = player[this.layer].ssChalBest
        i = i.add(1).max(0).pow(j.max(1e5).log(1e5).sqrt()).log10().add(1).pow(0.5).sub(1).pow10()
        return i
    },
    getRequire() {
        let i = new Decimal(1e10)
        return i
    },
    canReset() {
        let req = tmp[this.layer].getRequire
        return player.points.gte(req)
    },
    getResetGain() {
        let req = tmp[this.layer].getRequire
        let gain = player.points.lt(req) ? new Decimal(0) : player.points.log10().sub(req.log10()).mul(2).add(125).sqrt().mul(2.23606797749979).sub(25).pow10().floor()

        gain = gain.mul(tmp[this.layer].buyables[42].effect.pp)
        gain = gain.mul(tmp.q.effect)
        gain = gain.mul(tmp.q.generationEff[1])
        return gain
    },
    getNextAt() {
        let req = tmp[this.layer].getRequire
        let next = tmp[this.layer].getResetGain
        next = next.div(tmp.q.generationEff[1])
        next = next.div(tmp.q.effect)
        next = next.div(tmp[this.layer].buyables[42].effect.pp)

        next = next.add(1).floor().log10().add(25).div(2.23606797749979).pow(2).sub(125).div(2).add(req.log10()).pow10()
        return next
    },
    prestigeButtonText(){
        let gain = tmp[this.layer].getResetGain
        let nextAt = tmp[this.layer].getNextAt

        let amt = "You can reset for " + format(gain, 2) + " Prestige Points"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    doReset() {
        player.points = D(0)
        setBuyableAmount(this.layer, "11", D(0))
        setBuyableAmount(this.layer, "12", D(0))
        setBuyableAmount(this.layer, "13", D(0))
        if (!hasUpgrade("p", 13)) { setBuyableAmount(this.layer, "14", D(0)) }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["buyables", [1]],
                "blank",
                ["challenges", [1]],
                "blank", 
            ],
            unlocked(){
                return true
            },
        },
        "Prestige Essence": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player[this.layer].essence, 2)}</h2> Prestige Essence. (${format(player[this.layer].essencePS, 3)}/sec)` }],
                ["display-text",
                function() { return `Your prestige essence is naturally slowing down by /${format(player[this.layer].essenceReduction, 2)}!` }],
                "blank", 
                ["buyables", [2, 3, 4]],
            ],
            unlocked(){
                return player.p.total.gte(10)
            },
        },
        "Prestige Upgrades": {
            content: [
                "main-display",
                ["display-text",
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player[this.layer].essence, 2)}</h2> Prestige Essence. (${format(player[this.layer].essencePS, 3)}/sec)` }],
                ["prestige-button", ""],
                "blank",
                ["upgrades", [1, 2, 3]],
            ],
            unlocked(){
                return player.p.total.gte(1e3)
            },
        },
        "Super Scaling": {
            content: [
                "main-display",
                ["display-text",
                function() { return `You have <h2 style="color: #C0C0C0; font-size: 26px; text-shadow: #C0C0C0 0px 0px 10px;">${format(player[this.layer].ssPoints)}</h2> Super Scaling Points, which multiplies point gain by &times;${format(tmp[this.layer].sspEff, 2)}. (${format(player[this.layer].ssPPS, 3)}/sec)` }],
                ["display-text",
                function() { return `You gain Super Scaling Points based off of your progress in the Super Scaling challenge. The higher your points, the higher the SSP you gain.` }],
                "blank",
                ["upgrades", [4]],
                "blank",
                ["challenges", 15],
            ],
            unlocked(){
                return hasUpgrade("p", 31)
            },
        },
        "Ranks": {
            content: [
                "main-display",
                "blank",
                ["buyables", [5]],
                "blank",
                ["microtabs", "RankTabs"],
            ],
            unlocked(){
                return inChallenge('q', 11)
            },
        },
    },
    microtabs: {
        "RankTabs": {
            "Rank Milestones": {
                content: [
                    ["milestones", [8, 7, 6, 5, 4, 3, 2, 1, 0]],
                ],
            },
            "Tier Milestones": {
                content: [
                    ["milestones", [102, 101, 100]],
                ],
            }
        }
    },
    milestones: {
        0: {
            requirementDescription: "Rank 1",
            effectDescription: "Weaken point's natural softcap slightly.",
            done() { return player[this.layer].buyables[51].gte(1) }
        },
        1: {
            requirementDescription: "Rank 2",
            effectDescription: "Basic Buyable 1's linear cost scaling is reduced by -0.25.",
            done() { return player[this.layer].buyables[51].gte(2) }
        },
        2: {
            requirementDescription: "Rank 3",
            effectDescription: "Every Basic Buyable 2 adds 0.6 free levels to Basic Buyable 1.",
            done() { return player[this.layer].buyables[51].gte(3) }
        },
        3: {
            requirementDescription: "Rank 4",
            effectDescription() { 
                return `Every Rank past 3 adds +5.0 to the prestige point effect exponent.<br>Currently: +${format(player[this.layer].buyables[51].sub(3).max(0).mul(5), 1)} to exp.`
            },
            done() { return player[this.layer].buyables[51].gte(4) }
        },
        4: {
            requirementDescription: "Rank 5",
            effectDescription: "Basic Buyable 1's quadratic cost scaling is reduced by -0.005.",
            done() { return player[this.layer].buyables[51].gte(5) }
        },
        5: {
            requirementDescription: "Rank 6",
            effectDescription: "Basic Buyable 2's linear cost scaling is nullified.",
            done() { return player[this.layer].buyables[51].gte(6) }
        },
        6: {
            requirementDescription: "Rank 7",
            effectDescription: "Prestige Extract's natural softcap is weakened slightly.",
            done() { return player[this.layer].buyables[51].gte(7) }
        },
        7: {
            requirementDescription: "Rank 8",
            effectDescription() { 
                return `Point's 2nd softcap is -4% weaker every Rank past 7.<br>Currently: -${formatPerc(player[this.layer].buyables[51].sub(7).max(0).pow_base(1/0.96), 2)} softcap strength.`
            },
            done() { return player[this.layer].buyables[51].gte(8) }
        },
        8: {
            requirementDescription: "Rank 12",
            effectDescription() { 
                return `PP Buyable 2 is +25.0% more effective every Rank past 11.<br>Currently: +${format(player[this.layer].buyables[51].sub(11).max(0).mul(0.25).add(1).sub(1).mul(100), 1)}% effective`
            },
            done() { return player[this.layer].buyables[51].gte(12) }
        },
        100: {
            requirementDescription: "Tier 1",
            effectDescription: "Weaken point's natural softcap slightly and eliminate PP Buyable 1's linear cost scaling.",
            done() { return player[this.layer].buyables[52].gte(1) }
        },
        101: {
            requirementDescription: "Tier 2",
            effectDescription: "Nullify PP Buyable 9's linear cost scaling.",
            done() { return player[this.layer].buyables[52].gte(2) }
        },
        102: {
            requirementDescription: "Tier 3",
            effectDescription() { 
                return `Add 1 free level for Basic Buyable 4 per Tier, and PP Buyable 9's effect base is increased by +0.3 every Tier past 2.<br>Currently: +${format(player[this.layer].buyables[52])} free levels, +${format(player[this.layer].buyables[52].sub(2).max(0).mul(0.3), 1)} effect base`
            },
            done() { return player[this.layer].buyables[52].gte(3) }
        },
    },
    buyables: (() => {
        const upgrades = {
            11: {
                type: 0,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(10), D(1.6), D(1.025)]}
                    if (hasUpgrade("p", 41)) {
                        obj.main[1] = D(1.25)
                    }
                    if (hasMilestone("p", 1)) {
                        obj.main[1] = obj.main[1].sub(0.25)
                    }
                    if (hasMilestone("p", 4)) {
                        obj.main[2] = obj.main[2].sub(0.005)
                    }
                    return obj
                },
                unlocked() { return player.bestPoints.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id11 effect!`)
                        x = D(0)
                    }
                    let i = x, j
                    i = i.add(tmp[this.layer].buyables[13].effect.free)
                    if (hasMilestone("p", 2)) {
                        i = i.add(player[this.layer].buyables[12].mul(0.6))
                    }
                    if (challengeCompletions("p", 12).gte(5)) { i = i.mul(1.05) }

                    j = D(2)
                    j = j.add(tmp[this.layer].buyables[12].effect)
                    j = j.mul(tmp[this.layer].buyables[13].effect.base)
                    if (hasUpgrade("p", 14)) { j = j.add(upgradeEffect(this.layer, 14)) }
                    if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(9)) { j = j.sub(1).div(3).add(1) }

                    i = Decimal.pow(j, i)

                    if (challengeCompletions("p", 12).gte(8)) { i = i.log10().pow([1, 1.01, 1.0201, 1.030301][challengeCompletions("p", 12).sub(7).max(0).toNumber()]).pow10() }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[11])
                    return `&times;${format(currEffect)} point gain.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[11])
                    const nextEffect = this.effect(player[this.layer].buyables[11].add(1))
                    return `&times;${format(nextEffect.div(currEffect), 2)} point gain.` 
                },
                scaleModifEffective(x) {
                    if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { x = x.pow(2) }

                    if (challengeCompletions("q", 11).gte(1)) {
                        x = x.mul(0.75)
                    }
                    return x
                },
                scaleModifCost(x) {
                    if (player[this.layer].buyables[31].gt(0)) { x = x.div(tmp[this.layer].buyables[31].effect.up1c) }
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions("q", 11).gte(1)) {
                        x = x.div(0.75)
                    }

                    if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { x = x.root(2) }
                    return x
                },
                scaleModifTarCost(x) {
                    if (player[this.layer].buyables[31].gt(0)) { x = x.mul(tmp[this.layer].buyables[31].effect.up1c) }
                    return x
                },
            },
            12: {
                type: 0,
                num: 2,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(250), D(2), D(1.05)]}
                    if (hasMilestone("p", 5)) {
                        obj.main[1] = D(1)
                    }
                    return obj
                },
                unlocked() { return player.bestPoints.gte(100) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 12)) { x = true }
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id12 effect!`)
                        x = D(0)
                    }
                    if (this.unavail()) { return D(0) }
                    let i = x, j

                    j = D(0.25)
                    j = j.add([0, 0.025, 0.055, 0.09, 0.13, 0.175, 0.225, 0.28, 0.34, 0.405, 0.475][challengeCompletions("p", 12).toNumber()]);
                    i = Decimal.mul(j, i)
                    if (challengeCompletions("p", 12).gte(3)) { i = i.add(1).pow(1.1).sub(1) }
                    i = i.add(1).pow(tmp[this.layer].challenges[13].rewardEffect).sub(1)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[12])
                    return  `+${format(currEffect, 3)} Basic Buyable 1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[12])
                    const nextEffect = this.effect(player[this.layer].buyables[12].add(1))
                    return `+${format(nextEffect.sub(currEffect), 3)} Basic Buyable 1 base.` 
                },
                scaleModifEffective(x) {
                    if (challengeCompletions("p", 12).gte(6)) { x = x.div([1, 1.025, 1.08, 1.167, 1.3, 1.6][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }      
                    return x
                },
                scaleModifCost(x) {
                    x = x.pow(tmp[this.layer].buyables[42].effect.up2c)
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions("p", 12).gte(6)) { x = x.mul([1, 1.025, 1.08, 1.167, 1.3, 1.6][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }      
                    return x
                },
                scaleModifTarCost(x) {
                    x = x.root(tmp[this.layer].buyables[42].effect.up2c)
                    return x
                },
            },
            13: {
                type: 0,
                num: 3,
                costD: {type: 0, exp: 1, main: [D(6), D(1.15), D(1.0005)]},
                unlocked() { return player.bestPoints.gte(1e5) && challengeCompletions("p", 11).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id13 effect!`)
                        x = D(0)
                    }
                    let i = x, j
                    if (challengeCompletions("p", 12).gte(2)) { i = i.mul(1.2) }

                    j = [D(0.5), D(1.02)];
                    if (challengeCompletions("p", 12).gte(4)) { j[1] = j[1].add(0.01) }
                    j[0] = j[0].add(tmp[this.layer].buyables[23].effect.free)

                    i = {free: Decimal.mul(j[0], i), base: Decimal.pow(j[1], i)};
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[13])
                    return `+${format(currEffect.free, 2)} free BB1, &times;${format(currEffect.base, 3)} BB1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[13])
                    const nextEffect = this.effect(player[this.layer].buyables[13].add(1))
                    return `+${format(nextEffect.free.sub(currEffect.free), 2)} free BB1, &times;${format(nextEffect.base.div(currEffect.base), 3)} BB1 base.` 
                },
                scaleModifEffective(x) {
                    if (hasUpgrade("p", 12)) { x = x.sub(upgradeEffect('p', 12)) }
                    x = x.div(tmp[this.layer].buyables[21].effect.up3s)
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    x = x.mul(tmp[this.layer].buyables[21].effect.up3s)
                    if (hasUpgrade("p", 12)) { x = x.add(upgradeEffect('p', 12)) }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            14: {
                type: 0,
                num: 4,
                costD: {type: 0, exp: 1, main: [D(20), D(1.1), D(1.001)]},
                unlocked() { return player.bestPoints.gte(1e10) && hasUpgrade("p", 11) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id14 effect!`)
                        x = D(0)
                    }
                    let i = x, j
                    if (hasMilestone("p", 102)) {
                        i = i.add(player[this.layer].buyables[52])
                    }

                    j = D(1.01)
                    j = j.add(tmp[this.layer].buyables[33].effect.up4b)
                    i = Decimal.pow(j, i)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[14])
                    return `^${format(currEffect, 4)} points.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[14])
                    const nextEffect = this.effect(player[this.layer].buyables[14].add(1))
                    return `^${format(nextEffect.div(currEffect), 4)} point gain.`
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
            21: {
                type: 1,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(10), D(10**0.5), D(10**0.005)]}
                    if (hasMilestone("p", 100)) {
                        obj.main[1] = D(1)
                    }
                    return obj
                },
                unlocked() { return player[this.layer].bestEssence.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id21 effect!`)
                        x = D(0)
                    }
                    let i = x, j
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = i.mul(tmp[this.layer].buyables[23].effect.peu1)
                    j = D(2.2)
                    j = j.add(tmp[this.layer].buyables[32].effect.ppu1)
                    i = {
                        ppe: Decimal.pow(j, i.add(1).pow(1.333).log10().add(1).pow(0.9).sub(1).pow10().sub(1)), 
                        up3s: i.add(1).pow(0.7).sub(1).mul(0.03).add(1)
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[21])
                    return `&times;${format(currEffect.ppe, 2)} Essence, -${formatPerc(currEffect.up3s)} Basic Buyable 3 scaling.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[21])
                    const nextEffect = this.effect(player[this.layer].buyables[21].add(1))
                    return `&times;${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence, -${formatPerc(nextEffect.up3s.div(currEffect.up3s))} Basic Buyable 3 scaling.` 
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
            22: {
                type: 1,
                num: 2,
                costD: {type: 1, exp: 0, main: [D(100), D(2), D(1.3)]},
                unlocked() { return player[this.layer].bestEssence.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id22 effect!`)
                        x = D(0)
                    }
                    if (x.lt(1)) { return {exp: D(0), pps: D(1)}; }
                    let i = x, j
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    if (hasMilestone("p", 8)) {
                        i = i.mul(player[this.layer].buyables[51].sub(11).max(0).mul(0.25).add(1))
                    }

                    j = D(0.75); // less = it slows down less
                    i = {
                        exp: i.ln().mul(j).add(1).root(j).mul(0.5),
                        pps: player[this.layer].essence.add(1).pow(i.mul(0.25).add(1).ln()).log10().pow(i.ln().mul(0.01).add(1)).pow10()
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[22])
                    return `+${format(currEffect.exp, 2)} Essence exponent (&times;${format(player[this.layer].total.add(1).mul(2).pow(currEffect.exp).div(Decimal.pow(2, currEffect.exp)), 2)} Essence), Essence boosts points by ${format(currEffect.pps, 2)}&times;.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[22])
                    const nextEffect = this.effect(player[this.layer].buyables[22].add(1))
                    return `+${format(nextEffect.exp.sub(currEffect.exp), 2)} Essence exponent (&times;${format(player[this.layer].total.add(1).mul(2).pow(nextEffect.exp.sub(currEffect.exp)).div(Decimal.pow(2, nextEffect.exp.sub(currEffect.exp))), 2)} Essence), Essence boosts points by ${format(nextEffect.pps.div(currEffect.pps), 2)}&times;.` 
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
            23: {
                type: 1,
                num: 3,
                costD: {type: 0, exp: 0, main: [D(1e4), D(10), D(1)]},
                unlocked() { return player[this.layer].bestEssence.gte(100) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id23 effect!`)
                        x = D(0)
                    }
                    let i = x
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = {
                        peu1: i.div(10).add(1).ln().add(1),
                        free: i.add(10).mul(100).cbrt().div(20).sub(0.5).mul(3)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[23])
                    return `PP Buyable 1 is ${format(currEffect.peu1.sub(1).mul(100))}% more effective, +${format(currEffect.free, 2)} Basic Buyable 3 Free base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[23])
                    const nextEffect = this.effect(player[this.layer].buyables[23].add(1))
                    return `PP Buyable 1 is ${format(nextEffect.peu1.div(currEffect.peu1).sub(1).mul(100))}% more effective, +${format(nextEffect.free.sub(currEffect.free), 2)} Basic Buyable 3 Free base.` 
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
            31: {
                type: 1,
                num: 4,
                costD: {type: 1, exp: 0, main: [D(1e7), D(5), D(1.2)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e4) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id31 effect!`)
                        x = D(0)
                    }
                    if (x.lt(1)) { return {ppe: D(1), up1c: D(1)}; }
                    let i = x
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = {
                        ppe: player.points.add(1).log10().pow(i.div(10).add(1).sqrt().sub(1).mul(20)),
                        up1c: Decimal.pow(20, i.pow(1.1))
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[31])
                    return `&times;${format(currEffect.ppe, 2)} Essence from Points, Basic Buyable 1's cost is divided by ${format(currEffect.up1c, 2)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[31])
                    const nextEffect = this.effect(player[this.layer].buyables[31].add(1))
                    return `&times;${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence from Points, Basic Buyable 1's cost is divided by ${format(nextEffect.up1c.div(currEffect.up1c), 2)}.` 
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
            32: {
                type: 1,
                num: 5,
                costD: {type: 0, exp: 0, main: [D(1e8), D(1), D(2)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e7) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id32 effect!`)
                        x = D(0)
                    }
                    let i = x
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = {
                        ppu1: i.add(1).ln().add(1).pow(0.9).sub(1).exp().sub(1).div(8.34),
                        pts: i.mul(0.03).add(1).ln().add(1).cbrt()
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[32])
                    return `+${format(currEffect.ppu1, 3)} PP Buyable 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(currEffect.pts, 3)} slower.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[32])
                    const nextEffect = this.effect(player[this.layer].buyables[32].add(1))
                    return `+${format(nextEffect.ppu1.sub(currEffect.ppu1), 3)} PP Buyable 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(nextEffect.pts.div(currEffect.pts), 3)} slower.`
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
            33: {
                type: 1,
                num: 6,
                costD: {type: 0, exp: 1, main: [D(10), D(1.1), D(1.001)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e8) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id33 effect!`)
                        x = D(0)
                    }
                    let i = x
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = {
                        ppe: Decimal.pow(1.01, i),
                        up4b: i.mul(0.1).add(1).ln().mul(0.02)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[33])
                    return `^${format(currEffect.ppe, 4)} Essence gain, +${format(currEffect.up4b, 4)} Basic Buyable 4 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[33])
                    const nextEffect = this.effect(player[this.layer].buyables[33].add(1))
                    return `^${format(nextEffect.ppe.div(currEffect.ppe), 4)} Essence gain, +${format(nextEffect.up4b.sub(currEffect.up4b), 4)} Basic Buyable 4 base.`
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
            41: {
                type: 1,
                num: 7,
                costD: {type: 0, exp: 0, main: [D(1e12), D(1e6), D(1)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id41 effect!`)
                        x = D(0)
                    }
                    if (x.lt(1)) { return {ess: D(1), ppss: D(0)}; }
                    let i = x
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = {
                        ess: i.mul(0.01).add(1).ln().add(1).sqrt(),
                        ppss: sumHarmonicSeries(i).mul(0.25)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[41])
                    return `Essence's slowdown exponent is reduced by -${formatPerc(currEffect.ess, 3)}, +${format(currEffect.ppss, 2)} PP effect exponent.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[41])
                    const nextEffect = this.effect(player[this.layer].buyables[41].add(1))
                    return `Essence's slowdown exponent is reduced by -${formatPerc(nextEffect.ess.div(currEffect.ess), 3)}, +${format(nextEffect.ppss.sub(currEffect.ppss), 2)} PP effect exponent.`
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
            42: {
                type: 1,
                num: 8,
                costD: {type: 0, exp: 0, main: [D(1e15), D(1e4), D(3)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e12) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id42 effect!`)
                        x = D(0)
                    }
                    let i = x
                    i = i.add(tmp[this.layer].buyables[43].effect)
                    i = {
                        pp: i.add(1).pow(2).mul(0.05).add(0.95),
                        up2c: i.mul(0.05).add(1).ln().add(1).recip()
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[42])
                    return `Prestige Point gain is multiplied by ${format(currEffect.pp, 2)}&times;, and Basic Buyable 2's cost is raised ^${format(currEffect.up2c, 3)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[42])
                    const nextEffect = this.effect(player[this.layer].buyables[42].add(1))
                    return `Prestige Point gain is multiplied by ${format(nextEffect.pp.div(currEffect.pp), 2)}&times;, and Basic Buyable 2's cost is raised ^${format(nextEffect.up2c.div(currEffect.up2c), 3)}.` 
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
            43: {
                type: 1,
                num: 9,
                get costD() {
                    const obj = {type: 0, exp: 1, main: [D(20), D(1.2), D(1.001)]}
                    if (hasMilestone("p", 101)) {
                        obj.main[1] = D(1)
                    }
                    return obj
                },
                unlocked() { return player[this.layer].bestEssence.gte(1e15) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (Decimal.isNaN(x)) {
                        console.warn(`NaN detected as input in id43 effect!`)
                        x = D(0)
                    }
                    let i;
                    i = x
                    let j = D(0.2)
                    if (hasMilestone("p", 102)) {
                        j = j.add(player[this.layer].buyables[52].sub(2).max(0).mul(0.3))
                    }
                    
                    i = Decimal.mul(i, j)
                    return i;
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[43])
                    return `All previous PP Buyables gain +${format(currEffect, 1)} free levels.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[43])
                    const nextEffect = this.effect(player[this.layer].buyables[43].add(1))
                    return `All previous PP Buyables gain +${format(nextEffect.sub(currEffect), 1)} free levels.` 
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
            51: {
                type: 2,
                num: 1,
                costD: {type: 1, exp: 1, main: [D(6), D(1.2), D(1.1)]},
                unlocked() { return inChallenge('q', 11) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i;
                    i = x
                    return i;
                },
                dispEffect() {
                    return `Check Rank Milestones...`
                },
                dispEffBase() {
                    return `Check Rank Milestones...`
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
            52: {
                type: 2,
                num: 2,
                costD: {type: 0, exp: -1, main: [D(1e8), D(1e2), D(1e1)]},
                unlocked() { return inChallenge('q', 11) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i;
                    i = x
                    return i;
                },
                dispEffect() {
                    return `Check Tier Milestones...`
                },
                dispEffBase() {
                    return `Check Tier Milestones...`
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
            }
        };

        for (const upgrade of Object.values(upgrades)) {
            upgrade.cost = (x) => {
                if (upgrade.unavail()) { return D(Infinity) }
                let i, j, k;
                j = x
                k = upgrade.costD.main

                j = upgrade.scaleModifEffective(j)
                if (hasUpgrade('p', 43) && upgrade.type === 0) {
                    j = j.div(upgradeEffect('p', 43))
                }
                if (inChallenge('p', 13) && upgrade.type === 0) { 
                    j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) 
                }
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
                    x = player.points;
                }
                if (upgrade.type === 1) {
                    x = player.p.essence;
                }
                if (upgrade.type === 2) {
                    if (upgrade.num === 1) {
                        x = player.points
                    } else {
                        x = player.p.buyables[50 + upgrade.num - 1];
                    }
                }
                if (x.lt(upgrade.costD.main[0])) { return D(-1e-12) }

                let i, j;
                i = x
                j = upgrade.costD.main
                if (Decimal.isNaN(i)) {
                    // throw new Error("NaN in target resource")
                }
                i = upgrade.scaleModifTarCost(i)

                if (Decimal.isNaN(i)) {
                    // console.error("PROBLEM FUNCTION:")
                    // console.error(upgrade.scaleModifTarCost)
                    // throw new Error("NaN in target after modifier target cost")
                }
                i = i.layeradd10(-upgrade.costD.exp)

                if (Decimal.isNaN(i)) {
                    // it's likely only NaN because the value is too low and the amount of logs would make it NaN
                    // or something earlier up has caused crap to happen, make it default into a 0 value
                    console.warn(`NaN detected after layeradd10 in target of id${upgrade.id} before scaling`)
                    return D(0)
                }

                if (upgrade.costD.type === 0) {
                    j = upgrade.costD.main.map((x) => Decimal.log10(x));
                    if (j[2].eq(0)) { 
                        i = i.max(1).log10().sub(j[0]).div(j[1]);
                    } else {
                        i = i.max(1).log10().sub(j[0]).mul(j[2]).mul(4).add(j[1].pow(2)).sqrt().sub(j[1]).div(j[2]).div(2);
                    }
                } else if (upgrade.costD.type === 1) {
                    j = upgrade.costD.main
                    i = i.div(j[0]).log(j[1]).root(j[2]);
                }

                if (inChallenge('p', 13) && upgrade.type === 0) { 
                    i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) 
                }
                if (hasUpgrade('p', 43) && upgrade.type === 0) {
                    i = i.mul(upgradeEffect('p', 43))
                }
                i = upgrade.scaleModifTarEff(i)

                if (Decimal.isNaN(i)) {
                    // no clue what's happening
                    console.warn(`NaN detected after layeradd10 in target of id${upgrade.id} after scaling`)
                    return D(0)
                }
                return i
            }

            upgrade.title = () => { 
                if (upgrade.type === 0) {
                    return `Basic Buyable ${upgrade.num}` 
                }
                if (upgrade.type === 1) {
                    return `PP Buyable ${upgrade.num}` 
                }
                if (upgrade.type === 2) {
                    return `${[null, "Rank", "Tier", "Tetr"][upgrade.num]}s` 
                }
            },

            upgrade.stupidHack = () => {
                return shiftDown
            }

            upgrade.display = () => {
                // console.log(`%cbuyable id ${upgrade.id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
                let txt;
                if (upgrade.type === 2) {
                    txt = `${[null, "Rank", "Tier", "Tetr"][upgrade.num]} ${format(player.p.buyables[upgrade.id])}<br>` 
                } else {
                    txt = `You have ${format(player.p.buyables[upgrade.id], 0)} ${["Basic", "PP", null][upgrade.type]} Buyable ${upgrade.num}.<br>`
                }
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
                        txt += `Points`
                    }
                    if (upgrade.type === 1) {
                        txt += `Essence`
                    }
                    if (upgrade.type === 2) {
                        txt += [null, "Points", "Ranks", "Tiers"][upgrade.num]
                    }
                }
                return txt
            }
            upgrade.canAfford = () => {
                let resource;
                if (upgrade.type === 0) {
                    resource = player.points;
                }
                if (upgrade.type === 1) {
                    resource = player.p.essence;
                }
                if (upgrade.type === 2) {
                    if (upgrade.num === 1) {
                        resource = player.points
                    } else {
                        resource = player.p.buyables[50 + upgrade.num - 1];
                    }
                }
                return resource.gte(upgrade.cost());
            }
            upgrade.buy = () => {
                if (upgrade.type === 0) {
                    player.points = player.points.sub(upgrade.cost());
                }
                if (upgrade.type === 1) {
                    player.p.essence = player.p.essence.sub(upgrade.cost());
                }
                if (upgrade.type === 2) {
                    if (upgrade.num >= 3) {
                        setBuyableAmount('p', "52", D(0))
                    }
                    if (upgrade.num >= 2) {
                        setBuyableAmount('p', "51", D(0))
                        player.p.milestones = []
                    }
                    tmp.q.doReset(true)
                }
                addBuyables(upgrade.layer, upgrade.id, 1);
            };
            upgrade.buyMax = () => {
                setBuyableAmount(upgrade.layer, upgrade.id, upgrade.target().add(1).floor().max(player[this.layer].buyables[upgrade.id]))
            }
        }
        return upgrades;
    })(),
    challenges: {
        11: {
            unlocked() {
                let i = false
                if (player[this.layer].total.gte(1)) { i = true }
                return i
            },
            name: "Strengthened Dilation",
            challengeDescription: "Point dilation is stronger.",
            goalDescription: `Get ${format(1e9)} Points.`,
            canComplete() { return player.points.gte(1e9) },
            rewardDescription: `Unlock Basic Buyable 3 and point scaling beyond ${format(1e10)} is weaker.`,
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade("p", 13)) { setBuyableAmount(this.layer, "14", D(0)) }
            },
            getDepths() {
                let i = D(1)
                if (inChallenge('p', 14)) i = i.mul(Decimal.mul(2, tmp[this.layer].challenges[14].getDepths))
                return i
            }
        },
        12: {
            unlocked() {
                let i = false
                if (player[this.layer].total.gte(10)) { i = true }
                return i
            },
            name() { return `No BB2 (${format(challengeCompletions("p", 12), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription() {
                switch (challengeCompletions("p", 12).toNumber()) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return `Basic Buyable 2 is disabled.`
                    case 5:
                    case 6:
                        return `Basic Buyable 2 is disabled and Basic Buyable 1 scales faster.`
                    case 7:
                    case 8:
                        return `Basic Buyable 2 is disabled, Basic Buyable 1 scales faster, and point gain is reduced.`
                    case 9:
                        return `Basic Buyable 2 is disabled, Basic Buyable 1 scales faster, point gain is reduced, and Basic Buyable 1's base is weakened.`
                    case 10:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 12 description sucks lmao ${challengeCompletions("p", 12).toNumber()} out of bounds?`)
                }
            },
            rewardDescription() {
                switch (challengeCompletions("p", 12).toNumber()) {
                    case 0:
                        return `BB2's base is increased by +${format(0.025, 3)}`
                    case 1:
                        return `BB2's base is increased by +${format(0.03, 3)}, and make Basic Buyable 3 ${format(20, 3)}% more effective`
                    case 2:
                        return `BB2's base is increased by +${format(0.035, 3)}, and raise Basic Buyable 2's effect to the ^${format(1.1, 3)}`
                    case 3:
                        return `BB2's base is increased by +${format(0.04, 3)}, and Basic Buyable 3's multiplier &times;${format(1.02, 3)} -> &times;${format(1.03, 3)}`
                    case 4:
                        return `BB2's base is increased by +${format(0.045, 3)}, and Basic Buyable 1 is ${format(15, 3)}% more effective`
                    case 5:
                        return `BB2's base is increased by +${format(0.05, 3)} and scales ${formatPerc(1/(1-0.025), 2)} slower`
                    case 6:
                        return `BB2's base is increased by +${format(0.055, 3)} and scales ${formatPerc(1/(1-0.05), 3)} slower`
                    case 7:
                        return `BB2's base is increased by +${format(0.06, 3)}, scales ${formatPerc(1/(1-0.075), 3)} slower, and BB1's effect is dilated by ^${format(1.01, 3)}`
                    case 8:
                        return `BB2's base is increased by +${format(0.065, 3)}, scales ${formatPerc(1/(1-0.1), 3)} slower, and BB1's effect is dilated by ^${format(1.01, 3)}`
                    case 9:
                        return `BB2's base is increased by +${format(0.07, 3)}, scales ${formatPerc(1/(1-0.2), 3)} slower, and BB1's effect is dilated by ^${format(1.01, 3)}`
                    case 10:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 12 reward desc sucks lmao ${challengeCompletions("p", 12).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 9
                return [D(1e6), D(1e8), D(1e10), D(1e12), D(1e14), D(1e14), D(1e16), D(1e13), D(1e18), D(1e18)][challengeCompletions("p", 12).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp[this.layer].challenges[12].goal)} Points.`
            },
            canComplete() { return player.points.gte(tmp[this.layer].challenges[12].goal) },
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade("p", 13)) { setBuyableAmount(this.layer, "14", D(0)) }
            },
            getDepths() {
                let i = D(1)
                return i
            },
            completionLimit() {
                return D(10)
            }
        },
        13: {
            unlocked() {
                let i = false
                if (player[this.layer].total.gte(100)) { i = true }
                return i
            },
            name: "Super Scaling",
            challengeDescription: 'All basic buyables scale harsher, and PP\'s effect is nullified',
            rewardEffect() {
                let i = player[this.layer].ssChalBest
                i = i.max(1e5).log(1e5).sub(1).div(10).add(1).ln().div(2).add(1)
                return i
            },
            rewardDisplay() { return `Basic Buyable 2\'s effect is raised to the ^${format(this.rewardEffect(), 4)}` },
            goal() {
                return D(Infinity)
            },
            goalDescription() {
                return `Get higher than ${format(player[this.layer].ssChalBest)} Points.`
            },
            canComplete() { return false },
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade("p", 13)) { setBuyableAmount(this.layer, "14", D(0)) }
            },
            getDepths() {
                let i = D(1)
                return i
            },
            completionLimit() {
                return D(1)
            }
        },
        14: {
            unlocked() {
                let i = false
                if (hasUpgrade("p", 11)) { i = true }
                return i
            },
            name() { return `Crippled Points (${format(challengeCompletions("p", 14), 0)})`},
            challengeDescription: 'Point\'s scaling is starts earlier, and Strengthened Dilation is applied twice.',
            rewardEffect() {
                let i = challengeCompletions("p", 14)
                i = Decimal.pow(25, i.pow(1.2))
                return i
            },
            rewardDisplay() { return `Point scaling at ${format(1e10)} is delayed to ${format(this.rewardEffect().mul(1e10))} (Doesn't work in challenges)` },
            goal() {
                let i = challengeCompletions("p", 14)
                i = Decimal.pow(100, i.pow(1.5)).mul(1e12)
                return i
            },
            target() {
                let i = player.points
                i = i.div(1e12).log(100).root(1.5)
                return i
            },
            goalDescription() {
                return `Get ${format(tmp[this.layer].challenges[14].goal)} Points.`
            },
            canComplete() { return player.points.gte(tmp[this.layer].challenges[14].goal) },
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade("p", 13)) { setBuyableAmount(this.layer, "14", D(0)) }
            },
            getDepths() {
                let i = D(1)
                return i
            },
            completionLimit() {
                return D(Infinity)
            },
            countsAs: [11]
        },
    },
    upgrades: {
        11: {
            title: "Four of Each",
            description: "Unlock Basic Buyable and Challenge 4.",
            cost: new Decimal(100000),
            unlocked: true,
        },
        12: {
            title: "Delay. Delay?",
            description: "Prestige Essence delays Basic Buyable 3 cost.",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("p", 11) },
            effect() { 
                let ret = player[this.layer].essence.max(10).log10().log10().add(1).pow(2).sub(1)
                return ret;
            },
            effectDisplay() { return `-${format(this.effect(), 3)} purchases` }, 
        },
        13: {
            title: "Designations",
            description: "Keep Basic Buyable 4 on PP reset, and unlock a new prestige layer.",
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade("p", 12) },
        },
        14: {
            title: "PE -> BB1",
            description: "Basic Buyable 1's base is increased based off of Prestige Essence.",
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade("p", 13) },
            effect() { 
                let ret = player[this.layer].essence.max(1).log10().pow(1.5).mul(2)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}` }, 
        },
        15: {
            title: "PBx -> BBx",
            description: "[unimplemented] Prestige Buyables 4-6 add 0.4 free levels to Basic Buyables 1-3 respectively.",
            cost: new Decimal('e450'),
            unlocked() { return challengeCompletions("q", 11).gte(1) },
        },
        21: {
            title: "AutoUnlock I",
            description: "Unlock the Basic Buyable 1 Autobuyer.",
            cost: new Decimal(10000),
            unlocked: true,
        },
        22: {
            title: "AutoUnlock II",
            description: "Unlock the Basic Buyable 2 Autobuyer.",
            cost: new Decimal(250000),
            unlocked() { return hasUpgrade("p", 21) },
        },
        23: {
            title: "AutoUnlock III",
            description: "Unlock the Basic Buyable 3 Autobuyer.",
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade("p", 22) },
        },
        24: {
            title: "AutoUnlock IV",
            description: "[unimplemented] Unlock the Basic Buyable 4 Autobuyer.",
            cost: new Decimal('e800'),
            unlocked() { return challengeCompletions("q", 11).gte(1) },
        },
        31: {
            title: "Accumulator",
            description: "Unlock Super Scaling Accumulation.",
            cost: new Decimal(3e6),
            unlocked: true,
        },
        41: {
            title: "UP1 Cheapener",
            description: "Upgrade 1's exponential scaling is decreased from 1.60 to 1.25.",
            cost: new Decimal(1e9),
            unlocked() { return hasUpgrade("p", 31) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            }
        },
        42: {
            title: "Secondary Reward",
            description: "Challenge Completions multiply point gain.",
            cost: new Decimal(1e12),
            unlocked() { return hasUpgrade("p", 31) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = D(0)
                for (let i in tmp.p.challenges) {
                    ret = ret.add(challengeCompletions('p', i))
                }
                ret = ret.pow_base(2)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 2)}` }, 
        },
        43: {
            title: "Upgrade Dampener",
            description: "All basic buyables scale slower based off of your total prestige points.",
            cost: new Decimal(1e15),
            unlocked() { return hasUpgrade("p", 31) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player[this.layer].total.max(1e6).log(1e6).ln().add(1).ln().div(10).add(1)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 2)}` }, 
        },
        44: {
            title: "Point Pusher",
            description: "The second point softcap at 1.000 Dc is delayed based off of your Super Scaling Points.",
            cost: new Decimal(1e21),
            unlocked() { return hasUpgrade("p", 31) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player[this.layer].ssPoints.max(1e21).div(1e21).pow(0.25)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` }, 
        },
        45: {
            title: "wip",
            description: "wip",
            cost: new Decimal('e10000'),
            unlocked() { return challengeCompletions("q", 11).gte(1) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                return D(1)
                // let ret = player[this.layer].ssPoints.max(1e21).div(1e21).pow(0.25)
                // return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` }, 
        },
    }
})

addLayer("q", {
    name: "quaternions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 1, // Row the layer is in on the tree (0 is the first row)
	branches: ["p"],
    hotkeys: [
        {key: "q", description: "Q: Reset for quaternions", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return hasUpgrade("p", 13) || Decimal.gt(player[this.layer].best, 0) },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        bestPointsInQ: D(0),
        timeInQ: D(0),
        allocated: [D(0), D(0), D(0), D(0)],
        allocGen: [D(0), D(0), D(0), D(0)],
    }},
    color() {
        return gRC(player.timePlayed / 6, 1.0, 1.0)
    },
    requires: new Decimal(1e8), // Can be a function that takes requirement increases into account
    resource: "quaternions", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() { return player.p.total }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player[this.layer].timeInQ = player[this.layer].timeInQ.add(player.globalTS.mul(diff))

        for (let i = 0; i < player[this.layer].allocated.length; i++) {
            player[this.layer].allocGen[i] = player[this.layer].allocGen[i].add(tmp[this.layer].generationGain[i].mul(player.globalTS).mul(diff))
        }
    },
    effect(){
        let i = player.q.total
        i = i.mul(0.2).add(1).sqrt()
        return i
    },
    effectDescription(){
        return ` multiplying prestige point gain by &times;${format(tmp[this.layer].effect, 2)}.`
    },
    generationGain() {
        const arr = []
        for (let i = 0; i < player[this.layer].allocated.length; i++) {
            arr.push(player[this.layer].allocated[i].pow(2).div(100))
        }
        return arr
    },
    generationEff() {
        const arr = []
        for (let i = 0; i < player[this.layer].allocated.length; i++) {
            arr.push(D(0))
        }
        arr[0] = player[this.layer].allocGen[0].add(1).pow(2)
        arr[1] = player[this.layer].allocGen[1].add(1).root(5)
        arr[2] = player[this.layer].allocGen[2].add(1)
        arr[3] = player[this.layer].allocGen[3].add(1).root(2)
        
        return arr
    },
    getRequire() {
        let i = new Decimal(1e8)
        return i
    },
    canReset() {
        let req = tmp[this.layer].getRequire
        return player.p.total.gte(req)
    },
    getResetGain() {
        let req = tmp[this.layer].getRequire.log10()
        return player.p.total.lt(req) 
            ? new Decimal(0) 
            : player.p.total.max(1).log10().mul(req).sqrt().sub(req).mul(2).pow_base(2).floor()
    },
    getNextAt() {
        let req = tmp[this.layer].getRequire.log10()
        return tmp[this.layer].getResetGain.add(1).floor().log2().div(2).add(req).pow(2).div(req).pow10()
    },
    prestigeButtonText(){
        let gain = tmp[this.layer].getResetGain
        let nextAt = tmp[this.layer].getNextAt

        let amt = "You can reset for " + format(gain) + " Quaternions"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Prestige Points for the next"

        return amt + nxt
    },
    doReset(isInside) {
        player.points = D(0)
        player.p.bestPointsInP = D(0)

        player.p.points = D(0)
        player.p.best = D(0)
        player.p.total = D(0)

        player.p.essence = D(0)
        player.p.bestEssence = D(0)

        setBuyableAmount('p', "11", D(0))
        setBuyableAmount('p', "12", D(0))
        setBuyableAmount('p', "13", D(0))
        setBuyableAmount('p', "14", D(0))
        setBuyableAmount('p', "21", D(0))
        setBuyableAmount('p', "22", D(0))
        setBuyableAmount('p', "23", D(0))
        setBuyableAmount('p', "31", D(0))
        setBuyableAmount('p', "32", D(0))
        setBuyableAmount('p', "33", D(0))
        setBuyableAmount('p', "41", D(0))
        setBuyableAmount('p', "42", D(0))
        setBuyableAmount('p', "43", D(0))

        if (!isInside) {
            setBuyableAmount('p', "51", D(0))
            setBuyableAmount('p', "52", D(0))
            setBuyableAmount('p', "53", D(0))

            player.p.milestones = []
        }
        
        player.p.ssChalBest = D(1e5)
        player.p.ssPoints = D(0)
        player.p.ssTotal = D(0)

        player.p.challenges[13] = D(0)
        if (!hasMilestone(this.layer, 9)) {
            player.p.challenges[11] = D(0)
            player.p.challenges[12] = D(0)
            player.p.challenges[14] = D(0)
        }
        
        if (!hasMilestone(this.layer, 8)) {
            player.p.upgrades = []
            if (hasMilestone(this.layer, 0)) {
                player.p.upgrades.push(21)
            }
            if (hasMilestone(this.layer, 1)) {
                player.p.upgrades.push(22)
            }
            if (hasMilestone(this.layer, 2)) {
                player.p.upgrades.push(23)
            }
        }
    },
    clickables: (() => {
        const obj = {}
        for (let i = 0; i < 4; i++) {
            obj[i + 11] = {
                title: ["+1", "+i", "+j", "+k"][i],
                display() {
                    return `Currently: ${format(player[this.layer].allocated[i])}${["", "i", "j", "k"][i]}`
                },
                canClick() {
                    return player[this.layer].points.gte(1)
                },
                onClick() {
                    player[this.layer].points = player[this.layer].points.sub(1)
                    player[this.layer].allocated[i] = player[this.layer].allocated[i].add(1)
                }
            }
            obj[i + 21] = {
                title: ["+All", "+All i", "+All j", "+All k"][i],
                display() {
                    return `Currently: ${format(player[this.layer].allocated[i])}${["", "i", "j", "k"][i]}`
                },
                canClick() {
                    return player[this.layer].points.gte(1)
                },
                onClick() {
                    player[this.layer].allocated[i] = player[this.layer].allocated[i].add(player[this.layer].points)
                    player[this.layer].points = D(0)
                }
            }
        }
        return obj
    })(),
    milestones: {
        0: {
            requirementDescription: "2 total quaternions",
            effectDescription: "Keep BB1 autobuyer.",
            done() { return player[this.layer].total.gte(2) }
        },
        1: {
            requirementDescription: "3 total quaternions",
            effectDescription: "Keep BB2 autobuyer.",
            done() { return player[this.layer].total.gte(3) }
        },
        2: {
            requirementDescription: "5 total quaternions",
            effectDescription: "Keep BB3 autobuyer.",
            done() { return player[this.layer].total.gte(5) }
        },
        3: {
            requirementDescription: "10 total quaternions",
            effectDescription: "PPB1-3 are autobought.",
            done() { return player[this.layer].total.gte(10) }
        },
        4: {
            requirementDescription: "100 total quaternions",
            effectDescription: "PPB4-6 are autobought.",
            done() { return player[this.layer].total.gte(100) }
        },
        5: {
            requirementDescription: "1,000 total quaternions",
            effectDescription: "PPB7-9 are autobought.",
            done() { return player[this.layer].total.gte(1000) }
        },
        6: {
            requirementDescription: "10,000 total quaternions",
            effectDescription: "Gain 1% of PP gained every second.",
            done() { return player[this.layer].total.gte(10000) }
        },
        7: {
            requirementDescription: "1,000,000 total quaternions",
            effectDescription: "Unlock new quaternion challenges.",
            done() { return player[this.layer].total.gte(1e6) }
        },
        8: {
            requirementDescription: "100.000 M total quaternions",
            effectDescription: "Keep all PP Upgrades",
            done() { return player[this.layer].total.gte(1e8) }
        },
        9: {
            requirementDescription: "10.000 B total quaternions",
            effectDescription: "Keep PP Challenges 1, 2, and 4",
            done() { return player[this.layer].total.gte(1e10) }
        },
    },
    challenges: {
        11: {
            unlocked: true,
            name: "Rank Loss",
            challengeDescription: "Point gain is reduced by ^0.1. While in this challenge, Ranks and Tiers are unlocked.",
            goalDescription: `Get ${format(1e300)} Points.`,
            canComplete() { return player.points.gte(1e300) },
            rewardDescription: `Basic Buyable 1 scales 25.000% slower. Unlock a few more prestige upgrades and quaternion buyables.`,
            getDepths() {
                let i = D(1)
                return i
            },
            onExit() {
                tmp[this.layer].doReset(false)
                updateTemp()
                tmp[this.layer].doReset(false)
                updateTemp()
                tmp[this.layer].doReset(false)
                updateTemp()
            }
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
                ["clickables", [1, 2]],
                "blank",
                ["display-text",
                function() { return `<span style="color: #ff8080">Your <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(player[this.layer].allocated[0])}</h2>&times;[1] is generating <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(tmp[this.layer].generationGain[0], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #ff8080">You have <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(player[this.layer].allocGen[0], 2)}</h2> red charge, which is boosting point gain by <h2 style="text-shadow: #ff0000 0px 0px 10px;">${format(tmp[this.layer].generationEff[0], 2)}</h2>&times;.</span>` }],
                "blank",
                ["display-text",
                function() { return `<span style="color: #ffff80">Your <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(player[this.layer].allocated[1])}</h2>&times;[i] is generating <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(tmp[this.layer].generationGain[1], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #ffff80">You have <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(player[this.layer].allocGen[1], 2)}</h2> yellow charge, which is boosting prestige point gain by <h2 style="text-shadow: #ffff00 0px 0px 10px;">${format(tmp[this.layer].generationEff[1], 2)}</h2>&times;.</span>` }],
                "blank",
                ["display-text",
                function() { return `<span style="color: #80ff80">Your <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(player[this.layer].allocated[2])}</h2>&times;[j] is generating <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(tmp[this.layer].generationGain[2], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #80ff80">You have <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(player[this.layer].allocGen[2], 2)}</h2> green charge, which is boosting prestige essence by <h2 style="text-shadow: #00ff00 0px 0px 10px;">${format(tmp[this.layer].generationEff[2], 2)}</h2>&times;.</span>` }],
                "blank",
                ["display-text",
                function() { return `<span style="color: #8080ff">Your <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(player[this.layer].allocated[3])}</h2>&times;[k] is generating <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(tmp[this.layer].generationGain[3], 2)}</h2> red charge/s.</span>` }],
                ["display-text",
                function() { return `<span style="color: #8080ff">You have <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(player[this.layer].allocGen[3], 2)}</h2> blue charge, which is boosting super scaling points by <h2 style="text-shadow: #0000ff 0px 0px 10px;">${format(tmp[this.layer].generationEff[3], 2)}</h2>&times;.</span>` }],
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
                "blank",
                ["milestones", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
            ],
            unlocked(){
                return true
            },
        },
        "Challenges": {
            content: [
                "main-display",
                ["prestige-button", ""],
                ["display-text",
                function() { return `You have ${format(player.p.total)} total prestige points.` }],
                "blank",
                ["challenges", [1]],
            ],
            unlocked(){
                return true
            },
        },
    },
})
