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
        if (player[this.layer].total.gte(10)) {
            let i, j = {dilate: D(1.333), exp: D(2)};
            j.exp = j.exp.div(tmp[this.layer].buyables[41].effect.ess)

            i = D(3);
            i = i.add(tmp[this.layer].buyables[22].effect.exp)
            i = player[this.layer].total.add(1).mul(2).pow(i).div(Decimal.pow(2, i));
            i = i.mul(tmp[this.layer].buyables[21].effect.ppe)
            i = i.mul(tmp[this.layer].buyables[31].effect.ppe)
            i = i.pow(tmp[this.layer].buyables[33].effect.ppe)

            let pps = i.mul(diff)
            let prev = player[this.layer].essence
            player[this.layer].essence = player[this.layer].essence.max(1).pow(j.exp).log10().pow(j.dilate).pow10().add(pps).log10().root(j.dilate).pow10().root(j.exp);
            player[this.layer].essencePS = player[this.layer].essence.sub(prev).div(diff)
            player[this.layer].bestEssence = Decimal.max(player[this.layer].essence, player[this.layer].bestEssence);
        }

        if (inChallenge('p', 13)) {
            player[this.layer].ssChalBest = Decimal.max(player[this.layer].ssChalBest, player.points)
            if (hasUpgrade("p", 31)) {
                player[this.layer].ssPPS = player.points.max(1e5).log(1e5).pow(0.95).sub(1).pow10().pow(player[this.layer].ssChalBest.max(1e5).log(1e5))
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
    },
    effect(){
        let i = player[this.layer].total
        let j = D(3)
        j = j.add(tmp[this.layer].buyables[41].effect.ppss)
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
        let gain = player.points.lt(req) ? new Decimal(0) : player.points.log10().sub(req.log10()).mul(2).add(125).sqrt().mul(2.23607).sub(25).pow10().floor()
        gain = gain.mul(tmp[this.layer].buyables[42].effect.pp)
        return gain
    },
    getNextAt() {
        let req = tmp[this.layer].getRequire
        let next = tmp[this.layer].getResetGain
        next = next.div(tmp[this.layer].buyables[42].effect.pp)
        next = next.add(1).floor().log10().add(250).div(10).pow(2).add(req.log10()).sub(625).pow10()
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
                "blank", 
                ["buyables", [2, 3, 4, 5]],
            ],
            unlocked(){
                return player.p.total.gte(10)
            },
        },
        "Upgrades": {
            content: [
                "main-display",
                ["display-text",
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player[this.layer].essence, 2)}</h2> Prestige Essence. (${format(player[this.layer].essencePS, 3)}/sec)` }],
                ["prestige-button", ""],
                "blank",
                ["upgrades", [1, 2, 3, 4]],
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
                ["challenges", 13],
                "blank",
                ["upgrades", [4]],
            ],
            unlocked(){
                return hasUpgrade("p", 31)
            },
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
                    return obj
                },
                unlocked() { return player.bestPoints.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x, j
                    i = i.add(tmp[this.layer].buyables[13].effect.free)
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
                    return x
                },
                scaleModifCost(x) {
                    if (player[this.layer].buyables[31].gt(0)) { x = x.div(tmp[this.layer].buyables[31].effect.up1c) }
                    return x
                },
                scaleModifTarEff(x) {
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
                costD: {type: 0, exp: 0, main: [D(250), D(2), D(1.05)]},
                unlocked() { return player.bestPoints.gte(100) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 12)) { x = true }
                    return x
                },
                effect(x) {
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
                    return  `+${format(currEffect, 3)} Upgrade 1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[12])
                    const nextEffect = this.effect(player[this.layer].buyables[12].add(1))
                    return `+${format(nextEffect.sub(currEffect), 3)} Upgrade 1 base.` 
                },
                scaleModifEffective(x) {
                    if (challengeCompletions("p", 12).gte(6)) { x = x.div([1, 1.03, 1.08, 1.15, 1.225, 1.3][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }      
                    return x
                },
                scaleModifCost(x) {
                    x = x.pow(tmp[this.layer].buyables[42].effect.up2c)
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions("p", 12).gte(6)) { x = x.mul([1, 1.03, 1.08, 1.15, 1.225, 1.3][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }      
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
                    return `+${format(currEffect.free, 2)} free UPG1, &times;${format(currEffect.base, 3)} UPG1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[13])
                    const nextEffect = this.effect(player[this.layer].buyables[13].add(1))
                    return `+${format(nextEffect.free.sub(currEffect.free), 2)} free UPG1, &times;${format(nextEffect.base.div(currEffect.base), 3)} UPG1 base.` 
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
                    let i = x, j
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
                costD: {type: 0, exp: 0, main: [D(10), D(10**0.5), D(10**0.005)]},
                unlocked() { return player[this.layer].bestEssence.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x, j
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
                    return `&times;${format(currEffect.ppe, 2)} Essence, -${formatPerc(currEffect.up3s)} Upgrade 3 scaling.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[21])
                    const nextEffect = this.effect(player[this.layer].buyables[21].add(1))
                    return `&times;${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence, -${formatPerc(nextEffect.up3s.div(currEffect.up3s))} Upgrade 3 scaling.` 
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
                unlocked() { return player[this.layer].bestEssence.gte(80) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (x.lt(1)) { return {exp: D(0), pps: D(1)}; }
                    let i = x, j

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
                unlocked() { return player[this.layer].bestEssence.gte(1e3) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x
                    i = {
                        peu1: i.div(10).add(1).ln().add(1),
                        free: i.add(10).mul(100).cbrt().div(20).sub(0.5).mul(3)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[23])
                    return `PP Upgrade 1 is ${format(currEffect.peu1.sub(1).mul(100))}% more effective, +${format(currEffect.free, 2)} Upgrade 3 Free base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[23])
                    const nextEffect = this.effect(player[this.layer].buyables[23].add(1))
                    return `PP Upgrade 1 is ${format(nextEffect.peu1.div(currEffect.peu1).sub(1).mul(100))}% more effective, +${format(nextEffect.free.sub(currEffect.free), 2)} Upgrade 3 Free base.` 
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
                unlocked() { return player[this.layer].bestEssence.gte(1e6) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (x.lt(1)) { return {ppe: D(1), up1c: D(1)}; }
                    let i = x
                    i = {
                        ppe: player.points.add(1).log10().pow(i.div(10).add(1).sqrt().sub(1).mul(20)),
                        up1c: Decimal.pow(20, i.pow(1.1))
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[31])
                    return `&times;${format(currEffect.ppe, 2)} Essence from Points, Upgrade 1's cost is divided by ${format(currEffect.up1c, 2)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[31])
                    const nextEffect = this.effect(player[this.layer].buyables[31].add(1))
                    return `&times;${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence from Points, Upgrade 1's cost is divided by ${format(nextEffect.up1c.div(currEffect.up1c), 2)}.` 
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
                    let i = x
                    i = {
                        ppu1: i.add(1).ln().add(1).pow(0.9).sub(1).exp().sub(1).div(8.34),
                        pts: i.mul(0.03).add(1).ln().add(1).cbrt()
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[32])
                    return `+${format(currEffect.ppu1, 3)} PP Upgrade 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(currEffect.pts, 3)} slower.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[32])
                    const nextEffect = this.effect(player[this.layer].buyables[32].add(1))
                    return `+${format(nextEffect.ppu1.sub(currEffect.ppu1), 3)} PP Upgrade 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(nextEffect.pts.div(currEffect.pts), 3)} slower.`
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
                costD: {type: 0, exp: 1, main: [D(10), D(1.2), D(1.001)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x
                    i = {
                        ppe: Decimal.pow(1.01, i),
                        up4b: i.mul(0.1).add(1).ln().mul(0.02)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[33])
                    return `^${format(currEffect.ppe, 4)} Essence gain, +${format(currEffect.up4b, 4)} Upgrade 4 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[33])
                    const nextEffect = this.effect(player[this.layer].buyables[33].add(1))
                    return `^${format(nextEffect.ppe.div(currEffect.ppe), 4)} Essence gain, +${format(nextEffect.up4b.sub(currEffect.up4b), 4)} Upgrade 4 base.`
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
                unlocked() { return player[this.layer].bestEssence.gte(1e11) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (x.lt(1)) { return {ess: D(1), ppss: D(0)}; }
                    let i = x
                    i = {
                        ess: i.mul(0.01).add(1).ln().add(1).sqrt(),
                        ppss: sumHarmonicSeries(i).mul(0.1)
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
                unlocked() { return player[this.layer].bestEssence.gte(1e14) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x
                    i = {
                        pp: i.add(1).pow(2).mul(0.05).add(0.95),
                        up2c: i.mul(0.05).add(1).ln().add(1).recip()
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[42])
                    return `Prestige Point gain is multiplied by ${format(currEffect.pp, 2)}&times;, and Upgrade 2's cost is raised ^${format(currEffect.up2c, 3)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[42])
                    const nextEffect = this.effect(player[this.layer].buyables[42].add(1))
                    return `Prestige Point gain is multiplied by ${format(nextEffect.pp.div(currEffect.pp), 2)}&times;, and Upgrade 2's cost is raised ^${format(nextEffect.up2c.div(currEffect.up2c), 3)}.` 
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
                costD: {type: 0, exp: 0, main: [D(1e20), D(1e5), D(20)]},
                unlocked() { return player[this.layer].bestEssence.gte(1e20) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i, j, k;
                    i = x
                    return D(1)
                },
                dispEffect() {
                    const currEffect = this.effect(player[this.layer].buyables[43])
                    return `` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player[this.layer].buyables[43])
                    const nextEffect = this.effect(player[this.layer].buyables[43].add(1))
                    return `` 
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
        console.log(upgrades)
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
                if (x.lt(upgrade.costD.main[0])) { return D(-1e-12) }

                let i, j;
                i = x
                j = upgrade.costD.main

                i = upgrade.scaleModifTarCost(i)
                i = i.layeradd10(-upgrade.costD.exp)

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
                return i
            }

            upgrade.title = () => { 
                if (upgrade.type === 0) {
                    return `Upgrade ${upgrade.num}` 
                }
                if (upgrade.type === 1) {
                    return `PP Upgrade ${upgrade.num}` 
                }
            },

            upgrade.stupidHack = () => {
                return shiftDown
            }

            upgrade.display = () => {
                // console.log(`%cbuyable id ${upgrade.id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
                let txt = `You have ${format(player.p.buyables[upgrade.id], 0)} ${["", "PP"][upgrade.type]} Upgrade ${upgrade.num}.<br>`
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
                return resource.gte(upgrade.cost());
            }
            upgrade.buy = () => {
                if (upgrade.type === 0) {
                    player.points = player.points.sub(upgrade.cost());
                }
                if (upgrade.type === 1) {
                    player.p.essence = player.p.essence.sub(upgrade.cost());
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
            goalDescription: `Get ${format(1e10)} Points.`,
            canComplete() { return player.points.gte(1e10) },
            rewardDescription: `Point scaling beyond ${format(1e10)} is weaker.`,
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
            name() { return `No Upgrade 2 (${format(challengeCompletions("p", 12), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription() {
                switch (challengeCompletions("p", 12).toNumber()) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return `Upgrade 2 is disabled.`
                    case 5:
                    case 6:
                        return `Upgrade 2 is disabled and Upgrade 1 scales faster.`
                    case 7:
                    case 8:
                        return `Upgrade 2 is disabled, Upgrade 1 scales faster, and point gain is reduced.`
                    case 9:
                        return `Upgrade 2 is disabled, Upgrade 1 scales faster, point gain is reduced, and Upgrade 1's base is weakened.`
                    case 10:
                        return `maxxed lmao`
                    default:
                        throw new Error(`challenge 12 description sucks lmao ${challengeCompletions("p", 12).toNumber()} out of bounds?`)
                }
            },
            rewardDescription() {
                switch (challengeCompletions("p", 12).toNumber()) {
                    case 0:
                        return `UP2's base is increased by +${format(0.025, 3)}`
                    case 1:
                        return `UP2's base is increased by +${format(0.03, 3)}, and make Upgrade 3 ${format(20, 3)}% more effective`
                    case 2:
                        return `UP2's base is increased by +${format(0.035, 3)}, and raise Upgrade 2's effect to the ^${format(1.1, 3)}`
                    case 3:
                        return `UP2's base is increased by +${format(0.04, 3)}, and Upgrade 3's multiplier &times;${format(1.02, 3)} -> &times;${format(1.03, 3)}`
                    case 4:
                        return `UP2's base is increased by +${format(0.045, 3)}, and Upgrade 1 is ${format(15, 3)}% more effective`
                    case 5:
                        return `UP2's base is increased by +${format(0.05, 3)} and scales ${formatPerc(1.03, 3)} slower`
                    case 6:
                        return `UP2's base is increased by +${format(0.055, 3)} and scales ${formatPerc(1.0485436893203883, 3)} slower`
                    case 7:
                        return `UP2's base is increased by +${format(0.06, 3)}, scales ${formatPerc(1.0648148148148147, 3)} slower, and UP1's effect is dilated by ^${format(1.01, 3)}`
                    case 8:
                        return `UP2's base is increased by +${format(0.065, 3)}, scales ${formatPerc(1.065217391304348, 3)} slower, and UP1's effect is dilated by ^${format(1.01, 3)}`
                    case 9:
                        return `UP2's base is increased by +${format(0.07, 3)}, scales ${formatPerc(1.0769230769230769, 3)} slower, and UP1's effect is dilated by ^${format(1.01, 3)}`
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
            challengeDescription: 'All upgrades scale harsher, and PP\'s effect is nullified',
            rewardEffect() {
                let i = player[this.layer].ssChalBest
                i = i.max(1e5).log(1e5).sub(1).div(10).add(1).pow(0.4)
                return i
            },
            rewardDisplay() { return `Upgrade 2\'s effect is raised to the ^${format(this.rewardEffect(), 4)}` },
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
            description: "Unlock Upgrade and Challenge 4.",
            cost: new Decimal(100000),
            unlocked: true,
        },
        12: {
            title: "Delay. Delay?",
            description: "Prestige Essence delays Upgrade 3 cost.",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade("p", 11) },
            effect() { 
                let ret = player[this.layer].essence.max(1e5).log10().sub(5).div(10).add(1).ln()
                return ret;
            },
            effectDisplay() { return `-${format(this.effect(), 3)} purchases` }, 
        },
        13: {
            title: "That new prestige layer, I guess.",
            description: "Keep Upgrade 4 on PP reset, and unlock a new prestige layer. (You can continue for a long time after this unlock, don't worry)",
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade("p", 12) },
        },
        14: {
            title: "PE -> UP1",
            description: "Upgrade 1's base is increased based off of Prestige Essence.",
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade("p", 13) },
            effect() { 
                let ret = player[this.layer].essence.max(1).log10().pow(1.5).mul(3)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}` }, 
        },
        21: {
            title: "AutoUnlock I",
            description: "Unlock the Upgrade 1 Autobuyer.",
            cost: new Decimal(10000),
            unlocked: true,
        },
        22: {
            title: "AutoUnlock II",
            description: "Unlock the Upgrade 2 Autobuyer.",
            cost: new Decimal(250000),
            unlocked() { return hasUpgrade("p", 21) },
        },
        23: {
            title: "AutoUnlock III",
            description: "Unlock the Upgrade 3 Autobuyer.",
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade("p", 22) },
        },
        31: {
            title: "Idk lmao",
            description: "Unlock Super Scaling Accumulation.",
            cost: new Decimal(3e6),
            unlocked: true,
        },
        41: {
            title: "UP1 Cheapener",
            description: "Upgrade 1's exponential scaling is decreased from 1.60 to 1.25.",
            cost: new Decimal(1e9),
            unlocked: true,
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            }
        },
        42: {
            title: "secondary reward",
            description: "Challenge Completions multiply point gain.",
            cost: new Decimal(1e12),
            unlocked: true,
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
            title: "Upgrade cost scaler",
            description: "All upgrades scale slower based off of your total prestige points.",
            cost: new Decimal(1e15),
            unlocked: true,
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player[this.layer].total.max(1e6).log(1e6).ln().div(10).add(1)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 2)}` }, 
        },
        44: {
            title: "Point Pusher",
            description: "The second point softcap at 1.000 Dc is delayed based off of your Super Scaling Points.",
            cost: new Decimal(1e21),
            unlocked: true,
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
    },
    effect(){
        let i = player.q.total
        i = i.add(1).pow(2)
        return i
    },
    effectDescription(){
        return ` multiplying prestige point gain by &times;${format(tmp[this.layer].effect, 2)}.`
    },
    getRequire() {
        let i = new Decimal(1e8)
        return i
    },
    canReset() {
        let req = tmp[this.layer].getRequire
        return player.p.points.gte(req)
    },
    getResetGain() {
        let req = tmp[this.layer].getRequire
        return player.p.points.lt(req) ? new Decimal(0) : Decimal.pow(10, player.p.points.max(1).log(req).sub(1)).floor()
    },
    getNextAt() {
        let req = tmp[this.layer].getRequire
        return Decimal.pow(req, tmp[this.layer].getResetGain.add(1).log10().add(1))
    },
    prestigeButtonText(){
        let gain = tmp[this.layer].getResetGain
        let nextAt = tmp[this.layer].getNextAt

        let amt = "You can reset for " + format(gain) + " Quaternions"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Prestige Points for the next"

        return amt + nxt
    },
    doReset() {
        player.points = D(0)
        player.p.points = D(0)
        player.p.best = D(0)
        player.p.total = D(0)
        player.p.essence = D(0)
        player.p.bestEssence = D(0)
        player.p.ssChalBest = D(1e5)
        player.p.bestPointsInP = D(0)
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
        setBuyableAmount('p', "51", D(0))
        setBuyableAmount('p', "52", D(0))
        setBuyableAmount('p', "53", D(0))
        player.p.challenges[11] = D(0)
        player.p.challenges[12] = D(0)
        player.p.challenges[13] = D(0)
        player.p.challenges[14] = D(0)
        player.p.upgrades = []
    },
})
