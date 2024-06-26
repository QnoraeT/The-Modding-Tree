"use strict";

function failTo1(x) {
    try {
        return x
    } catch {
        return D(1)
    }
}

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        bestPointsInP: D(0),
        timeInP: D(0),
        essence: D(0),
        bestEssence: D(0),
        essencePS: D(0),
        ssChalBest: D(1e5)
    }},
    color: "#8000FF",
    requires: new Decimal(1e10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player[this.layer].timeInP = player[this.layer].timeInP.add(player.globalTS.mul(diff))
        if (player.p.total.gte(10)) {
            let i, j = {dilate: D(1.4), exp: D(2)};
            j.exp = j.exp.div(tmp.p.buyables[41].effect.ess)

            i = D(3);
            i = i.add(tmp.p.buyables[22].effect.exp)
            i = player.p.total.add(1).mul(2).pow(i).div(Decimal.pow(2, i));
            i = i.mul(tmp.p.buyables[21].effect.ppe)
            i = i.mul(tmp.p.buyables[31].effect.ppe)
            i = i.pow(tmp.p.buyables[33].effect.ppe)

            let pps = i.mul(diff)
            let prev = player.p.essence
            player.p.essence = player.p.essence.max(1).pow(j.exp).log10().pow(j.dilate).pow10().add(pps).log10().root(j.dilate).pow10().root(j.exp);
            player.p.essencePS = player.p.essence.sub(prev).div(diff)
            player.p.bestEssence = Decimal.max(player.p.essence, player.p.bestEssence);
        }

        if (inChallenge('p', 13)) {
            player.p.ssChalBest = Decimal.max(player.p.ssChalBest, player.points)
        }

        if (hasUpgrade('p', 21)) {
            tmp.p.buyables[11].buyMax()
        }

        if (hasUpgrade('p', 22)) {
            tmp.p.buyables[12].buyMax()
        }

        if (hasUpgrade('p', 23)) {
            tmp.p.buyables[13].buyMax()
        }
    },
    effect(){
        let i = player.p.total
        let j = [D(3), D(0.6)]
        j[0] = j[0].add(tmp.p.buyables[41].effect.ppss)
        let sc = [{ start: D(1e40), pow: D(1) }, { start: D(1e60), pow: D(1) }]
        // sc[0].start = sc[0].start.mul(tmp.p.buyables[41].effect.ppss)
        i = i.max(0).add(1).log10().add(1).pow(j[1]).sub(1).mul(j[0]).pow10()
        //i = i.max(0).mul(Decimal.pow(2, j[0]).sub(1)).add(1).root(j[0]).log10().add(1).root(j[1]).sub(1).pow10().sub(1).pow10();
        // if (i.gte(sc[0].start)) { i = scale(i, 0, false, sc[0].start, sc[0].pow, D(0.5)) }
        // if (i.gte(sc[1].start)) { i = scale(i, 1.3, false, sc[1].start, sc[1].pow, D(1.1)) }
        return i
    },
    effectDescription(){
        return ` multiplying point gain by ${format(tmp.p.effect, 2)}x`
    },
    getRequire() {
        let i = new Decimal(1e10)
        return i
    },
    canReset() {
        let req = tmp.p.getRequire
        return player.points.gte(req)
    },
    getResetGain() {
        let req = tmp.p.getRequire
        return player.points.lt(req) ? new Decimal(0) : player.points.log10().sub(req.log10()).mul(2).add(125).sqrt().mul(2.23607).sub(25).pow10()
        // return player.points.lt(req) ? new Decimal(0) : player.points.log10().sub(req.log10()).add(625).sqrt().mul(10).sub(250).pow10();
    },
    getNextAt() {
        let req = tmp.p.getRequire
        return tmp.p.getResetGain.add(1).floor().log10().add(250).div(10).pow(2).add(req.log10()).sub(625).pow10()
    },
    prestigeButtonText(){
        let gain = tmp.p.getResetGain
        let nextAt = tmp.p.getNextAt

        let amt = "You can reset for " + format(gain, 2) + " Prestige Points"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return true },
    doReset() {
        player.points = D(0)
        setBuyableAmount(this.layer, "11", D(0))
        setBuyableAmount(this.layer, "12", D(0))
        setBuyableAmount(this.layer, "13", D(0))
        if (!hasUpgrade('p', 13)) { setBuyableAmount(this.layer, "14", D(0)) }
    },
    tabFormat: {
        "Stuff": {
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
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player.p.essence, 2)}</h2> Prestige Essence. (${format(player.p.essencePS, 3)}/sec)` }],
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
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player.p.essence, 2)}</h2> Prestige Essence. (${format(player.p.essencePS, 3)}/sec)` }],
                ["prestige-button", ""],
                "blank",
                ["upgrades", [1, 2]],
            ],
            unlocked(){
                return player.p.total.gte(1e3)
            },
        },
    },
    buyables: (() => {
        const upgrades = {
            11: {
                type: 0,
                num: 1,
                costD: {type: 0, exp: 0, main: [D(10), D(2), D(1.02)]},
                unlocked() { return player.bestPoints.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x, j
                    i = i.add(tmp.p.buyables[13].effect.free)
                    if (challengeCompletions("p", 12).gte(5)) { i = i.mul(1.05) }
                    i = scale(i, 0.1, false, D(100), D(1), D(0.5))

                    j = D(2)
                    j = j.add(tmp.p.buyables[12].effect)
                    j = j.mul(tmp.p.buyables[13].effect.base)
                    if (hasUpgrade('p', 14)) { j = j.add(upgradeEffect(this.layer, 14)) }
                    if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(9)) { j = j.sub(1).div(3).add(1) }

                    i = Decimal.pow(j, i)

                    if (challengeCompletions("p", 12).gte(8)) { i = i.log10().pow([1, 1.01, 1.0201, 1.030301][challengeCompletions("p", 12).sub(7).max(0).toNumber()]).pow10() }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[11])
                    return `${format(currEffect)}x point gain.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[11])
                    const nextEffect = this.effect(player.p.buyables[11].add(1))
                    return `${format(nextEffect.div(currEffect), 2)}x point gain.` 
                },
                scaleModifEffective(x) {
                    if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { x = x.pow(2) }
                    return x
                },
                scaleModifCost(x) {
                    if (player.p.buyables[31].gt(0)) { x = x.div(tmp.p.buyables[31].effect.up1c) }
                    return x
                },
                scaleModifTarEff(x) {
                    if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { x = x.root(2) }
                    return x
                },
                scaleModifTarCost(x) {
                    if (player.p.buyables[31].gt(0)) { x = x.mul(tmp.p.buyables[31].effect.up1c) }
                    return x
                },
            },
            12: {
                type: 0,
                num: 2,
                costD: {type: 0, exp: 0, main: [D(250), D(3), D(1.01)]},
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
                    i = i.add(1).pow(tmp.p.challenges[13].rewardEffect).sub(1)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[12])
                    return  `+${format(currEffect, 3)} Upgrade 1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[12])
                    const nextEffect = this.effect(player.p.buyables[12].add(1))
                    return `+${format(nextEffect.sub(currEffect), 3)} Upgrade 1 base.` 
                },
                scaleModifEffective(x) {
                    if (challengeCompletions("p", 12).gte(6)) { x = x.div([1, 1.03, 1.08, 1.15, 1.225, 1.3][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }      
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions("p", 12).gte(6)) { x = x.mul([1, 1.03, 1.08, 1.15, 1.225, 1.3][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }      
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            13: {
                type: 0,
                num: 3,
                costD: {type: 0, exp: 0, main: [D(1e6), D(10), D(2)]},
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
                    j[0] = j[0].add(tmp.p.buyables[23].effect.free)

                    i = {free: Decimal.mul(j[0], i), base: Decimal.pow(j[1], i)};
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[13])
                    return `+${format(currEffect.free, 2)} free UPG1, x${format(currEffect.base, 3)} UPG1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[13])
                    const nextEffect = this.effect(player.p.buyables[13].add(1))
                    return `+${format(nextEffect.free.sub(currEffect.free), 2)} free UPG1, x${format(nextEffect.base.div(currEffect.base), 3)} UPG1 base.` 
                },
                scaleModifEffective(x) {
                    if (hasUpgrade('p', 12)) { x = x.sub(upgradeEffect('p', 12)) }
                    x = x.div(tmp.p.buyables[21].effect.up3s)
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    x = x.mul(tmp.p.buyables[21].effect.up3s)
                    if (hasUpgrade('p', 12)) { x = x.add(upgradeEffect('p', 12)) }
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
                unlocked() { return player.bestPoints.gte(1e10) && hasUpgrade('p', 11) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x, j
                    j = D(1.01)
                    j = j.add(tmp.p.buyables[33].effect.up4b)
                    i = Decimal.pow(j, i)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[14])
                    return `^${format(currEffect, 4)} points.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[14])
                    const nextEffect = this.effect(player.p.buyables[14].add(1))
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
                costD: {type: 0, exp: 0, main: [D(10), D(10**0.5), D(10**0.0025)]},
                unlocked() { return player.p.bestEssence.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x, j
                    i = i.mul(tmp.p.buyables[23].effect.peu1)
                    j = D(2.2)
                    j = j.add(tmp.p.buyables[32].effect.ppu1)
                    i = {
                        ppe: Decimal.pow(j, i.add(1).pow(1.333).log10().add(1).pow(0.9).sub(1).pow10().sub(1)), 
                        up3s: i.add(1).pow(0.7).sub(1).mul(0.03).add(1)
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[21])
                    return `x${format(currEffect.ppe, 2)} Essence, -${formatPerc(currEffect.up3s)} Upgrade 3 scaling.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[21])
                    const nextEffect = this.effect(player.p.buyables[21].add(1))
                    return `x${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence, -${formatPerc(nextEffect.up3s.div(currEffect.up3s))} Upgrade 3 scaling.` 
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
                unlocked() { return player.p.bestEssence.gte(80) },
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
                        pps: player.p.essence.add(1).pow(i.mul(0.25).add(1).ln()).log10().pow(i.ln().mul(0.01).add(1)).pow10()
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[22])
                    return `+${format(currEffect.exp, 2)} Essence exponent (x${format(player.p.total.add(1).mul(2).pow(currEffect.exp).div(Decimal.pow(2, currEffect.exp)), 2)} Essence), Essence boosts points by ${format(currEffect.pps, 2)}x.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[22])
                    const nextEffect = this.effect(player.p.buyables[22].add(1))
                    return `+${format(nextEffect.exp.sub(currEffect.exp), 2)} Essence exponent (x${format(player.p.total.add(1).mul(2).pow(nextEffect.exp.sub(currEffect.exp)).div(Decimal.pow(2, nextEffect.exp.sub(currEffect.exp))), 2)} Essence), Essence boosts points by ${format(nextEffect.pps.div(currEffect.pps), 2)}x.` 
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
                unlocked() { return player.p.bestEssence.gte(1e3) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x
                    i = {
                        peu1: i.add(10).mul(10).sqrt().div(10).sub(1).mul(2).add(1),
                        free: i.add(10).mul(100).cbrt().div(20).sub(0.5).mul(3)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[23])
                    return `PP Upgrade 1 is ${format(currEffect.peu1.sub(1).mul(100))}% more effective, +${format(currEffect.free, 2)} Upgrade 3 Free base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[23])
                    const nextEffect = this.effect(player.p.buyables[23].add(1))
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
                unlocked() { return player.p.bestEssence.gte(1e6) },
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
                    const currEffect = this.effect(player.p.buyables[31])
                    return  `x${format(currEffect.ppe, 2)} Essence from Points, Upgrade 1's cost is divided by ${format(currEffect.up1c, 2)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[31])
                    const nextEffect = this.effect(player.p.buyables[31].add(1))
                    return `x${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence from Points, Upgrade 1's cost is divided by ${format(nextEffect.up1c.div(currEffect.up1c), 2)}.` 
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
                unlocked() { return player.p.bestEssence.gte(1e7) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x
                    i = {
                        ppu1: i.add(1).ln().add(1).pow(0.9).sub(1).exp().sub(1).div(8.34),
                        pts: i.mul(0.025).add(1).ln().add(1)
                    }
                    if (i.pts.gte(1.5)) { i.pts = scale(i.pts, 0.2, false, D(1.5), D(1), D(0.1)) }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[32])
                    return `+${format(currEffect.ppu1, 3)} PP Upgrade 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(currEffect.pts, 3)} slower.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[32])
                    const nextEffect = this.effect(player.p.buyables[32].add(1))
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
                unlocked() { return player.p.bestEssence.gte(1e10) },
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
                    const currEffect = this.effect(player.p.buyables[33])
                    return `^${format(currEffect.ppe, 4)} Essence gain, +${format(currEffect.up4b, 4)} Upgrade 4 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[33])
                    const nextEffect = this.effect(player.p.buyables[33].add(1))
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
                unlocked() { return player.p.bestEssence.gte(1e11) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    if (x.lt(1)) { return {ess: D(1), ppss: D(0)}; }
                    let i = x
                    i = {
                        ess: i.mul(0.01).add(1).ln().add(1),
                        ppss: sumHarmonicSeries(i).mul(0.1)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[41])
                    return `Essence's slowdown exponent is reduced by -${formatPerc(currEffect.ess, 3)}, +${format(currEffect.ppss, 2)} PP effect exponent.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[41])
                    const nextEffect = this.effect(player.p.buyables[41].add(1))
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
                unlocked() { return player.p.bestEssence.gte(1e14) },
                unavail() {
                    let x = false
                    return x
                },
                effect(x) {
                    let i = x
                    i = {

                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[42])
                    return `` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[42])
                    const nextEffect = this.effect(player.p.buyables[42].add(1))
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
            43: {
                type: 1,
                num: 9,
                costD: {type: 0, exp: 0, main: [D(1e20), D(1e5), D(20)]},
                unlocked() { return player.p.bestEssence.gte(1e20) },
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
                    const currEffect = this.effect(player.p.buyables[43])
                    return `` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[43])
                    const nextEffect = this.effect(player.p.buyables[43].add(1))
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
                if (upgrade.type === 0) { j = scale(j, 0.1, false, D(100), D(1), D(3)) }
                if (inChallenge('p', 13) && upgrade.type === 0) { j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) }
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

                if (inChallenge('p', 13) && upgrade.type === 0) { i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) }
                if (upgrade.type === 0) { i = scale(i, 0.1, true, D(100), D(1), D(3)) }
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
                let txt = `You have ${format(player.p.buyables[upgrade.id], 0)} PP Upgrade ${upgrade.num}.<br>`
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
                        txt += `${format(upgrade.costD.main[0])} × ${format(upgrade.costD.main[1], 2)}<sup>x</sup> × ${format(upgrade.costD.main[2], 3)}<sup>x<sup>2</sup></sup>`
                    } else if (upgrade.costD.type === 1) {
                        txt += `${format(upgrade.costD.main[0])} × ${format(upgrade.costD.main[1], 2)}<sup>x<sup>${format(upgrade.costD.main[2], 3)}</sup></sup>`
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
                setBuyableAmount(upgrade.layer, upgrade.id, upgrade.target().add(1).floor().max(player.p.buyables[upgrade.id]))
            }
        }
        return upgrades;
    })(),
    // buyables: {

        // ...(()=>{
        //     let out = {}
        //     for (let id = 0; id < 4; id++) {
        //         out[id+11] = {
        //             title: function() { return `Upgrade ${id+1}` },
        //             get costD() {
        //                 let c = [
        //                     [D(10),  D(2),   D(1.02)],
        //                     [D(250), D(3),   D(1.01)],
        //                     [D(1e6), D(10),  D(2)],
        //                     [D(20),  D(1.1), D(1.001)]
        //                 ][id]
        //                 return c
        //             },
        //             unlocked() {
        //                 let u = false
        //                 if (player.bestPoints.gte([D(10), D(100), D(1e5), D(1e10)][id])) { u = true }
        //                 if (id === 2 && challengeCompletions("p", 11).lt(1)) { u = false }
        //                 if (id === 3 && !hasUpgrade('p', 11)) { u = false }
        //                 return u
        //             },
        //             effect(x) {
        //                 let i = x, j

        //                 switch (id) {
        //                     case 0:
        //                         i = i.add(tmp.p.buyables[13].effect.free)
        //                         if (challengeCompletions("p", 12).gte(5)) { i = i.mul(1.05) }

        //                         j = D(2)
        //                         j = j.add(tmp.p.buyables[12].effect)
        //                         j = j.mul(tmp.p.buyables[13].effect.base)
        //                         if (hasUpgrade('p', 14)) { j = j.add(upgradeEffect(this.layer, 14)) }
        //                         if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(9)) { j = j.sub(1).div(3).add(1) }

        //                         i = Decimal.pow(j, i)

        //                         if (challengeCompletions("p", 12).gte(8)) { i = i.log10().pow([1, 1.01, 1.0201, 1.050703][challengeCompletions("p", 12).sub(7).max(0).toNumber()]).pow10() }
        //                         if (i.gte(Number.MAX_VALUE)) { i = scale(i, 2.1, false, Number.MAX_VALUE, 1, D(1/2.2)) }
        //                         return i
        //                     case 1:
        //                         if (inChallenge('p', 12)) {
        //                             return new Decimal(0)
        //                         }

        //                         j = D(0.25)
        //                         j = j.add([0, 0.025, 0.055, 0.09, 0.13, 0.175, 0.225, 0.28, 0.34, 0.405, 0.55][challengeCompletions("p", 12).toNumber()]);
        //                         i = Decimal.mul(j, i)
        //                         if (challengeCompletions("p", 12).gte(3)) { i = i.add(1).pow(1.1).sub(1) }
        //                         i = i.add(1).pow(tmp.p.challenges[13].rewardEffect).sub(1)
        //                         return i
        //                     case 2:
        //                         if (challengeCompletions("p", 12).gte(2)) { i = i.mul(1.2) }
        //                         j = [D(0.5), D(1.02)];
        //                         if (challengeCompletions("p", 12).gte(4)) { j[1] = j[1].add(0.01) }
        //                         j[0] = j[0].add(tmp.p.buyables[23].effect.free)

        //                         i = {free: Decimal.mul(j[0], i), base: Decimal.pow(j[1], i)};
        //                         return i
        //                     case 3:
        //                         j = D(1.01)
        //                         j = j.add(tmp.p.buyables[33].effect.up4b)
        //                         i = Decimal.pow(j, i)
        //                         return i
        //                     default:
        //                         throw new RangeError(`uh oh, effect function failed at ${id} id lmao)`)
        //                 }
        //             },
        //             cost(x) { 
        //                 if (id === 1 && inChallenge('p', 12)) { return D(Infinity) }
        //                 let i, j, k;
        //                 j = x;
        //                 k = this.costD;
        //                 switch (id) {
        //                     case 0:
        //                         if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { 
        //                             j = j.pow(2) 
        //                         }
        //                         break;
        //                     case 1:
        //                         if (challengeCompletions("p", 12).gte(6)) { 
        //                             j = j.div([1, 1.03, 1.08, 1.15, 1.225, 1.4][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) 
        //                         }
        //                         break;
        //                     case 2:
        //                         if (hasUpgrade('p', 12)) { j = j.sub(upgradeEffect(this.layer, 12)) }
        //                         j = j.div(tmp.p.buyables[21].effect.up3s)
        //                         break;
        //                     case 3:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, cost function failed at ${id} id lmao (switch 1)`)
        //                 }

        //                 if (inChallenge('p', 13)) { j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) }
        //                 if (j.gte(1000)) { j = scale(j, 2.2, false, D(1000), D(1), D(3)) }
        //                 if (id === 2) {
        //                     if (j.gte(12)) { j = scale(j, 0, false, D(12), D(1), D(2)) }
        //                 } 

        //                 i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

        //                 switch (id) {
        //                     case 0:
        //                         i = i.div(tmp.p.buyables[31].effect.up1c)
        //                         break;
        //                     case 1:
        //                         break;
        //                     case 2:
        //                         break;
        //                     case 3:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, cost function failed at ${id} id lmao (switch 2)`)
        //                 }

        //                 if (id === 3) { i = i.pow10() }
        //                 return i
        //             },
        //             target(x = player.points) { 

        //                 if (x.lte(this.costD[0])) { return D(-1e-12) }
        //                 if (id === 1 && inChallenge('p', 12)) { return D(-1e-12) }

        //                 let i, j, k;
        //                 j = x
        //                 k = this.costD.map((x) => Decimal.log10(x));

        //                 switch (id) {
        //                     case 0:
        //                         j = j.mul(tmp.p.buyables[31].effect.up1c)
        //                         break;
        //                     case 1:
        //                         break;
        //                     case 2:
        //                         break;
        //                     case 3:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, target function failed at ${id} id lmao (switch 2)`)
        //                 }

        //                 if (id === 3) { j = j.log10() }

        //                 if (k[2].eq(0)) { 
        //                     i = j.max(1).log10().sub(k[0]).div(k[1]);
        //                 } else {
        //                     i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
        //                 }

        //                 if (id === 2) {
        //                     if (i.gte(12)) { i = scale(i, 0, true, D(12), D(1), D(2)) }
        //                 } 
        //                 if (i.gte(1000)) { i = scale(i, 2.2, true, D(1000), D(1), D(3)) }

        //                 if (inChallenge('p', 13)) { i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) }

        //                 switch (id) {
        //                     case 0:
        //                         if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { 
        //                             i = i.root(2) 
        //                         }
        //                         break;
        //                     case 1:
        //                         if (challengeCompletions("p", 12).gte(6)) { 
        //                             i = i.mul([1, 1.03, 1.08, 1.15, 1.225, 1.4][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) 
        //                         }
        //                         break;
        //                     case 2:
        //                         i = i.mul(tmp.p.buyables[21].effect.up3s)
        //                         if (hasUpgrade('p', 12)) { i = i.add(upgradeEffect(this.layer, 12)) }
        //                         break;
        //                     case 3:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, target function failed at ${id} id lmao (switch 1)`)
        //                 }

        //                 return i
        //             },
        //             display() { 
        //                 let txt = `You have ${format(player.p.buyables[id+11], 0)} Upgrade ${id+1}.<br>`

        //                 const currEffect = this.effect(player.p.buyables[id+11])
        //                 const nextEffect = this.effect(player.p.buyables[id+11].add(1))
        //                 if (shiftDown) {
        //                     txt += `Effect Base`
        //                     switch (id) {
        //                         case 0:
        //                             txt += `: ${format(nextEffect.div(currEffect), 2)}x point gain.` 
        //                             break;
        //                         case 1:
        //                             txt += `: +${format(nextEffect.sub(currEffect), 3)} Upgrade 1 base.` 
        //                             break;
        //                         case 2:
        //                             txt += `s: +${format(nextEffect.free.sub(currEffect.free), 2)} free UPG1, x${format(nextEffect.base.div(currEffect.base), 2)} UPG1 base.` 
        //                             break;
        //                         case 3:
        //                             txt += `: ^${format(nextEffect.div(currEffect), 3)} point gain.`
        //                             break;
        //                         default:
        //                             throw new RangeError(`uh oh, display function failed at ${id} id lmao (switch 1)`)
        //                     }
        //                     txt += `<br>Cost Formula: ` 
        //                     if (id === 3) { txt += `10<sup>` }
        //                     txt += `${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup>`
        //                     if (id === 3) { txt += `</sup>` }
        //                 } else {
        //                     txt += `Effect: `
        //                     switch (id) {
        //                         case 0:
        //                             txt += `${format(currEffect)}x point gain.` 
        //                             break;
        //                         case 1:
        //                             txt += `+${format(currEffect, 3)} Upgrade 1 base.` 
        //                             break;
        //                         case 2:
        //                             txt += `+${format(currEffect.free, 2)} free UPG1, x${format(currEffect.base, 2)} UPG1 base.` 
        //                             break;
        //                         case 3:
        //                             txt += `^${format(currEffect, 3)} points.` 
        //                             break;
        //                         default:
        //                             throw new RangeError(`uh oh, display function failed at ${id} id lmao (switch 2)`)
        //                     }
        //                     txt += `<br>Cost: ${format(this.cost())} Points`
        //                 }
        //                 return txt
        //             },
        //             canAfford() { 
        //                 return player.points.gte(this.cost()) 
        //             },
        //             buy() {
        //                 player.points = player.points.sub(this.cost())
        //                 setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        //             },
        //             buyMax() {
        //                 setBuyableAmount(this.layer, this.id, tmp.p.buyables[id+11].target.add(1).floor())
        //             }
        //         }
        //     }
        //     return out
        // })(),
        // ...(()=>{
        //     let out = {}
        //     let list = [21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53]
        //     for (let id = 0; id < 9; id++) {
        //         out[list[id]] = {
        //             title: function() { return `PP Upgrade ${id+1}` },
        //             get costD() {
        //                 // new Upgrade('pp1',  0,  c.d10,   {type: 0, main: [c.d10,   D(10 ** 0.5), D(10 ** 0.0025)]}, 1),
        //                 // new Upgrade('pp2',  1,  D(80),   {type: 1, main: [c.e2,    c.d2,   D(1.3)]},    1),
        //                 // new Upgrade('pp3',  2,  c.e4,    {type: 0, main: [D(1e5),  c.d10,  1]},      1),
        //                 // new Upgrade('pp4',  3,  c.e6,    {type: 1, main: [D(1e7),  c.d5,   D(c.d1_2)]}, 1),
        //                 // new Upgrade('pp5',  4,  c.e6,    {type: 0, main: [D(1e8),  1,   c.d2]},      1),
        //                 // new Upgrade('pp6',  5,  D(1e9),  {type: 0, main: [c.e10,   c.e2,   D(1.1)]},    1),
        //                 // new Upgrade('pp7',  6,  c.e10,   {type: 0, main: [D(1e12), c.e6,   1]},      1),
        //                 // new Upgrade('pp8',  7,  D(1e14), {type: 0, main: [D(1e15), c.e4,   c.d3]},      1),
        //                 // new Upgrade('pp9',  8,  D(1e20), {type: 0, main: [D(1e20), D(1e5), D(20)]},     1),
        //                 // new Upgrade('pp10', 9,  D(1e32), {type: 1, main: [D(1e32), c.e3,   D(2.2)]},    1),
        //                 // new Upgrade('pp11', 10, D(1e39), {type: 1, main: [D(1e40), c.e2,   c.d4]},      1),
        //                 let c = [
        //                     {type: 0, main: [D(10),   D(10 ** 0.5), D(10 ** 0.0025)]},
        //                     {type: 1, main: [D(100),  D(2),   D(1.3)]},
        //                     {type: 0, main: [D(1e5),  D(10),  D(1)]},
        //                     {type: 1, main: [D(1e7),  D(5),   D(1.2)]},
        //                     {type: 0, main: [D(1e8),  D(1),   D(2)]},
        //                     {type: 0, main: [D(10),   D(1.2), D(1.001)]},
        //                     {type: 0, main: [D(1e12), D(1e6), D(1)]},
        //                     {type: 0, main: [D(1e15), D(1e4), D(3)]},
        //                     {type: 0, main: [D(1e20), D(1e5), D(20)]},
        //                     // {type: 1, main: [D(1e32), D(1e3), D(2.2)]},
        //                     // {type: 1, main: [D(1e40), D(1e2), D(4)]},
        //                 ][id]
        //                 return c
        //             },
        //             unlocked() {
        //                 let u = false
        //                 if (player.p.bestEssence.gte([D(10), D(80), D(1e4), D(1e6), D(1e7), D(1e10), D(1e11), D(1e14), D(1e20)][id])) { u = true }
        //                 return u
        //             },
        //             effect(x) {
        //                 let i = x, j

        //                 switch (id) {
        //                     case 0:
        //                         i = i.mul(tmp.p.buyables[23].effect.peu1)
        //                         j = D(2.2)
        //                         j = j.add(tmp.p.buyables[32].effect.ppu1)
        //                         i = {
        //                             ppe: Decimal.pow(j, i.add(1).pow(1.2).log10().add(1).pow(0.9).sub(1).pow10().sub(1)), 
        //                             up3s: i.add(1).pow(0.7).sub(1).mul(0.03).add(1)
        //                         };
        //                         return i
        //                     case 1:
        //                         if (i.lt(1)) { return {exp: D(0), pps: D(1)}; }
        //                         j = D(0.25); // less = it slows down less
        //                         i = {
        //                             exp: i.ln().mul(j).add(1).root(j).mul(0.5),
        //                             pps: player.p.essence.add(1).pow(i.mul(0.25).add(1).ln()).log10().pow(i.ln().mul(0.01).add(1)).pow10()
        //                         };
        //                         if (i.exp.gte(4)) { i.exp = scale(i.exp, 0, false, D(4), D(1), D(0.5)) }
        //                         return i
        //                     case 2:
        //                         i = {
        //                             peu1: i.add(10).mul(10).sqrt().div(10).sub(1).mul(2).add(1),
        //                             free: i.add(10).mul(100).cbrt().div(20).sub(0.5).mul(3)
        //                         }
        //                         return i
        //                     case 3:
        //                         if (i.lt(1)) { return {ppe: D(1), up1c: D(1)}; }
        //                         i = {
        //                             ppe: player.points.add(1).log10().pow(i.cbrt()),
        //                             up1c: Decimal.pow(20, i.pow(0.7))
        //                         };
        //                         return i
        //                     case 4:
        //                         i = {
        //                             ppu1: i.add(1).ln().add(1).pow(0.9).sub(1).exp().sub(1).div(8.34),
        //                             pts: i.mul(0.025).add(1).ln().add(1)
        //                         }
        //                         if (i.pts.gte(1.5)) { i.pts = scale(i.pts, 0.2, false, D(1.5), D(1), D(0.1)) }
        //                         return i
        //                     case 5:
        //                         i = {
        //                             ppe: Decimal.pow(1.01, i.pow(0.75)),
        //                             up4b: i.mul(0.1).add(1).ln().mul(0.02)
        //                         }
        //                         return i
        //                     case 6:
        //                         i = {
        //                             ess: i.mul(0.01).add(1).ln().add(1),
        //                             ppss: Decimal.pow(20, i)
        //                         }
        //                         return i
        //                     case 7:
        //                         return i
        //                     case 8:
        //                         return i
        //                     default:
        //                         throw new RangeError(`uh oh, effect function failed at ${id} id lmao)`)
        //                 }
        //             },
        //             cost(x) { 
        //                 let i, j, k;
        //                 j = x;
        //                 k = this.costD.main;
        //                 switch (id) {
        //                     case 0:
        //                         break;
        //                     case 1:
        //                         break;
        //                     case 2:
        //                         break;
        //                     case 3:
        //                         break;
        //                     case 4:
        //                         break;
        //                     case 5:
        //                         break;
        //                     case 6:
        //                         break;
        //                     case 7:
        //                         break;
        //                     case 8:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, cost function failed at ${id} id lmao (switch 1)`)
        //                 }

        //                 if (j.gte(100)) { j = scale(j, 0, false, D(100), D(1), D(3)) }

        //                 if (this.costD.type === 0) {
        //                     i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);
        //                 } else if (this.costD.type === 1) {
        //                     i = Decimal.pow(k[1], j.pow(k[2])).mul(k[0]);
        //                 }

        //                 if (id === 5) { i = i.pow10() }
        //                 return i
        //             },
        //             target(x = player.p.essence) { 
        //                 if (x.lte(this.costD[0])) { return D(-1e-12) }

        //                 let i, j, k;
        //                 j = x

        //                 switch (id) {
        //                     case 0:
        //                         break;
        //                     case 1:
        //                         break;
        //                     case 2:
        //                         break;
        //                     case 3:
        //                         break;
        //                     case 4:
        //                         break;
        //                     case 5:
        //                         break;
        //                     case 6:
        //                         break;
        //                     case 7:
        //                         break;
        //                     case 8:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, target function failed at ${id} id lmao (switch 2)`)
        //                 }

        //                 if (id === 5) { j = j.log10() }

        //                 if (this.costD.type === 0) {
        //                     k = this.costD.main.map((x) => Decimal.log10(x));
        //                     if (k[2].eq(0)) { 
        //                         i = j.max(1).log10().sub(k[0]).div(k[1]);
        //                     } else {
        //                         i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
        //                     }
        //                 } else if (this.costD.type === 1) {
        //                     k = this.costD.main
        //                     i = j.div(k[0]).log(k[1]).root(k[2]);
        //                 }

        //                 if (i.gte(100)) { i = scale(i, 0, true, D(100), D(1), D(3)) }

        //                 switch (id) {
        //                     case 0:
        //                         break;
        //                     case 1:
        //                         break;
        //                     case 2:
        //                         break;
        //                     case 3:
        //                         break;
        //                     case 4:
        //                         break;
        //                     case 5:
        //                         break;
        //                     case 6:
        //                         break;
        //                     case 7:
        //                         break;
        //                     case 8:
        //                         break;
        //                     default:
        //                         throw new RangeError(`uh oh, target function failed at ${id} id lmao (switch 1)`)
        //                 }

        //                 return i
        //             },
        //             display() { 
        //                 let txt = `You have ${format(player.p.buyables[list[id]], 0)} PP Upgrade ${id+1}.<br>`

        //                 const currEffect = this.effect(player.p.buyables[list[id]])
        //                 const nextEffect = this.effect(player.p.buyables[list[id]].add(1))
        //                 // console.log(`%cbuyable id ${id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
        //                 if (shiftDown) {
        //                     txt += `Effect Bases: `
        //                     switch (id) {
        //                         case 0:
        //                             txt += `x${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence, -${formatPerc(nextEffect.up3s.div(currEffect.up3s))} Upgrade 3 scaling.` 
        //                             break;
        //                         case 1:
        //                             txt += `+${format(nextEffect.exp.sub(currEffect.exp), 2)} Essence exponent (x${format(player.p.total.add(1).mul(2).pow(nextEffect.exp.sub(currEffect.exp)).div(Decimal.pow(2, nextEffect.exp.sub(currEffect.exp))), 2)} Essence), Essence boosts points by ${format(nextEffect.pps.div(currEffect.pps), 2)}x.` 
        //                             break;
        //                         case 2:
        //                             txt += `PP Upgrade 1 is ${format(nextEffect.peu1.div(currEffect.peu1).sub(1).mul(100))}% more effective, +${format(nextEffect.free.sub(currEffect.free), 2)} Upgrade 3 Free base.` 
        //                             break;
        //                         case 3:
        //                             txt += `x${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence from Points, Upgrade 1's cost is divided by ${format(nextEffect.up1c.div(currEffect.up1c), 2)}.` 
        //                             break;
        //                         case 4:
        //                             txt += `+${format(nextEffect.ppu1.sub(currEffect.ppu1), 3)} PP Upgrade 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(nextEffect.pts.div(currEffect.pts), 3)} slower.`
        //                             break;
        //                         case 5:
        //                             txt += `^${format(nextEffect.ppe.div(currEffect.ppe), 3)} Essence gain, +${format(nextEffect.up4b.sub(currEffect.up4b), 4)} Upgrade 4 base.`
        //                             break;
        //                         case 6:
        //                             txt += `Essence's slowdown exponent is reduced by -${formatPerc(nextEffect.ess.div(currEffect.ess), 3)}, x${format(nextEffect.ppss.div(currEffect.ppss), 2)} PP effect softcap start.`
        //                             break;
        //                         case 7:
        //                             txt += ``
        //                             break;
        //                         case 8:
        //                             txt += ``
        //                             break;
        //                         default:
        //                             throw new RangeError(`uh oh, display function failed at ${id} id lmao (switch 1)`)
        //                     }
        //                     txt += `<br>Cost Formula: ` 
        //                     if (id === 5) { txt += `10<sup>` }
        //                     if (this.costD.type === 0) {
        //                         txt += `${format(this.costD.main[0])} × ${format(this.costD.main[1], 2)}<sup>x</sup> × ${format(this.costD.main[2], 3)}<sup>x<sup>2</sup></sup>`
        //                     } else if (this.costD.type === 1) {
        //                         txt += `${format(this.costD.main[0])} × ${format(this.costD.main[1], 2)}<sup>x<sup>${format(this.costD.main[2], 3)}</sup></sup>`
        //                     }
        //                     if (id === 5) { txt += `</sup>` }
        //                 } else {
        //                     txt += `Effect: `
        //                     switch (id) {
        //                         case 0:
        //                             txt += `x${format(currEffect.ppe, 2)} Essence, -${formatPerc(currEffect.up3s)} Upgrade 3 scaling.` 
        //                             break;
        //                         case 1:
        //                             txt += `+${format(currEffect.exp, 2)} Essence exponent, Essence boosts points by ${format(currEffect.pps, 2)}x.` 
        //                             break;
        //                         case 2:
        //                             txt += `PP Upgrade 1 is ${format(currEffect.peu1.sub(1).mul(100))}% more effective, +${format(currEffect.free, 2)} Upgrade 3 Free base.` 
        //                             break;
        //                         case 3:
        //                             txt += `x${format(currEffect.ppe, 2)} Essence from Points, Upgrade 1's cost is divided by ${format(currEffect.up1c, 2)}.` 
        //                             break;
        //                         case 4:
        //                             txt += `+${format(currEffect.ppu1, 3)} PP Upgrade 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(currEffect.pts, 3)} slower.` 
        //                             break;
        //                         case 5:
        //                             txt += `^${format(currEffect.ppe, 3)} Essence gain, +${format(currEffect.up4b, 4)} Upgrade 4 base.` 
        //                             break;
        //                         case 6:
        //                             txt += `Essence's slowdown exponent is reduced by -${formatPerc(currEffect.ess, 3)}, x${format(currEffect.ppss, 2)} PP effect softcap start.` 
        //                             break;
        //                         case 7:
        //                             txt += ``
        //                             break;
        //                         case 8:
        //                             txt += ``
        //                             break;
        //                         default:
        //                             throw new RangeError(`uh oh, display function failed at ${id} id lmao (switch 2)`)
        //                     }
        //                     txt += `<br>Cost: ${format(this.cost())} Essence`
        //                 }
        //                 return txt
        //             },
        //             canAfford() { 
        //                 return player.p.essence.gte(this.cost()) 
        //             },
        //             buy() {
        //                 player.p.essence = player.p.essence.sub(this.cost())
        //                 setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        //             },
        //             buyMax() {
        //                 setBuyableAmount(this.layer, this.id, tmp.p.buyables[list[id]].target.add(1).floor())
        //             }
        //         }
        //     }
        //     return out
        // })(),
    // },
    challenges: {
        11: {
            unlocked() {
                let i = false
                if (player.p.total.gte(1)) { i = true }
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
                if (!hasUpgrade('p', 13)) { setBuyableAmount(this.layer, "14", D(0)) }
            },
            getDepths() {
                let i = D(1)
                if (inChallenge('p', 14)) i = i.mul(Decimal.mul(2, tmp.p.challenges[14].getDepths))
                return i
            }
        },
        12: {
            unlocked() {
                let i = false
                if (player.p.total.gte(10)) { i = true }
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
                        return `UP2's base is increased by +${format(0.04, 3)}, and Upgrade 3's multiplier x${format(1.02, 3)} -> x${format(1.03, 3)}`
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
                return `Get ${format(tmp.p.challenges[12].goal)} Points.`
            },
            canComplete() { return player.points.gte(tmp.p.challenges[12].goal) },
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount(this.layer, "14", D(0)) }
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
                if (player.p.total.gte(100)) { i = true }
                return i
            },
            name: "Super Scaling",
            challengeDescription: 'All upgrades scale harsher, and PP\'s effect is nullified',
            rewardEffect() {
                let i = player.p.ssChalBest
                i = i.max(1e5).log(1e5).sub(1).div(10).add(1).pow(0.4)
                return i
            },
            rewardDisplay() { return `Upgrade 2\'s effect is raised to the ^${format(this.rewardEffect(), 4)}` },
            goal() {
                return D(Infinity)
            },
            goalDescription() {
                return `Get higher than ${format(player.p.ssChalBest)} Points.`
            },
            canComplete() { return false },
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount(this.layer, "14", D(0)) }
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
                if (hasUpgrade('p', 11)) { i = true }
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
                return `Get ${format(tmp.p.challenges[14].goal)} Points.`
            },
            canComplete() { return player.points.gte(tmp.p.challenges[14].goal) },
            onEnter() {
                player.points = D(0)
                setBuyableAmount(this.layer, "11", D(0))
                setBuyableAmount(this.layer, "12", D(0))
                setBuyableAmount(this.layer, "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount(this.layer, "14", D(0)) }
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
            description: "Unlock Upgrade and Challenge 4.",
            cost: new Decimal(100000),
            unlocked: true,
        },
        12: {
            description: "Prestige Essence delays Upgrade 3 cost.",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade('p', 11) },
            effect() { 
                let ret = player[this.layer].essence.max(1e5).log10().mul(2.1).sub(10.5).pow(1.5).div(7)
                return ret;
            },
            effectDisplay() { return `-${format(this.effect(), 3)} purchases` }, 
        },
        13: {
            description: "Keep Upgrade 4 on PP reset, and unlock a new prestige layer. (You can continue for a long time after this unlock, don't worry)",
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade('p', 12) },
        },
        14: {
            description: "Upgrade 1's base is increased based off of Prestige Essence",
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade('p', 13) },
            effect() { 
                let ret = player[this.layer].essence.max(1).log10().pow(1.5).mul(3)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}` }, 
        },
        21: {
            description: "Get the Upgrade 1 Autobuyer",
            cost: new Decimal(10000),
            unlocked: true,
        },
        22: {
            description: "Get the Upgrade 2 Autobuyer",
            cost: new Decimal(250000),
            unlocked() { return hasUpgrade('p', 21) },
        },
        23: {
            description: "Get the Upgrade 3 Autobuyer",
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade('p', 22) },
        },
    }
})

addLayer("q", {
    name: "quaternions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
        return ` multiplying prestige point gain by ${format(tmp.q.effect, 2)}x`
    },
    getRequire() {
        let i = new Decimal(1e8)
        return i
    },
    canReset() {
        let req = tmp.q.getRequire
        return player.p.points.gte(req)
    },
    getResetGain() {
        let req = tmp.q.getRequire
        return player.p.points.lt(req) ? new Decimal(0) : Decimal.pow(10, player.p.points.max(1).log(req).sub(1)).floor()
    },
    getNextAt() {
        let req = tmp.q.getRequire
        return Decimal.pow(req, tmp.q.getResetGain.add(1).log10().add(1))
    },
    prestigeButtonText(){
        let gain = tmp.q.getResetGain
        let nextAt = tmp.q.getNextAt

        let amt = "You can reset for " + format(gain) + " Quaternions"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Prestige Points for the next"

        return amt + nxt
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for quaternions", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return true },
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
