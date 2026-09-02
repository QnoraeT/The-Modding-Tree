"use strict";

let disabledPEB = []

addLayer('p', {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'P', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: 'p', description: "P: Reset for prestige points", onPress(){if (canReset('p')) doReset('p')}},
    ],
    layerShown(){ return true },
    startData() { return {
        unlocked: true,
        points: D(0),
        bestPointsInP: D(0),
        timeInP: D(0),
        essence: D(0),
        essenceReduction: D(1),
        bestEssence: D(0),
        essencePS: D(0),
        ssChalBest: D(1e5),
        ssPoints: D(0),
        ssTotal: D(0),
        dimensionAccu: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
        energy: D(0),
        totalEnergy: D(0),
        treePoints: D(0),
        totalBPUsed: D(0),
        buyable5Clicks: D(0),
        buyable5ClickCooldown: D(0),
        challenge21Clicks: D(0),
        challenge21ClicksRemain: D(200),
        challenge22Unlocks: [],
        hsPoints: D(0),
        hsBest: D(0),
        hsBestGalaxies: D(0),
        hsTotal: D(0),
        hsChalBest: D('e3000'),
        upg412BP: D(0)
    }},
    color: "#8000FF",
    requires: D(1e10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player.p.timeInP = player.p.timeInP.add(player.globalTS.mul(diff))

        if (hasMilestone('q', 6)) {
            let gen = tmp.p.getResetGain.mul(player.globalTS).mul(diff).mul(0.01)
            if (inChallenge('p', 21) || inChallenge('p', 23)) {
                gen = D(0)
            }

            player.p.points = player.p.points.add(gen)
            player.p.total = player.p.total.add(gen)
            player.p.best = player.p.best.max(player.p.points)
        }

        if (player.p.total.gte(10)) {
            let i, j = {dilate: D(1.333), exp: D(2)};
            if (hasMilestone('p', 6)) {
                j.dilate = D(
                    inChallenge('q', 11)
                        ? 1.3
                        : 1.33
                    )
            }

            j.exp = j.exp.div(tmp.p.buyables[41].effect.ess)

            i = D(3);
            i = i.add(tmp.p.buyables[22].effect.exp)
            i = player.p.total.add(1).mul(2).pow(i).div(Decimal.pow(2, i));
            i = i.mul(tmp.p.buyables[21].effect.ppe)
            i = i.mul(tmp.p.buyables[31].effect.ppe)
            if (!hasUpgrade('q', 11)) {
                i = i.mul(tmp.q.generationEff[2])
            }
            i = i.pow(tmp.p.buyables[33].effect.ppe)
            if (hasUpgrade('q', 11)) {
                i = i.pow(tmp.q.generationEff[2])
            }

            let pps = i.mul(player.globalTS).mul(diff)
            let prev = player.p.essence

            player.p.essenceReduction = pointGradualSoftcap(2, player.p.essence.max(1), j.exp, j.dilate, false)
            if (Decimal.eq_tolerance(player.p.essenceReduction, player.p.essenceReduction.add(pps))) {
                player.p.essenceReduction = player.p.essenceReduction.div(player.p.essence)
            } else {
                player.p.essenceReduction = pointGradualSoftcap(2, player.p.essenceReduction.add(pps.div(diff)), j.exp, j.dilate, true)
                player.p.essenceReduction = player.p.essenceReduction.sub(player.p.essence).div(pps.div(diff)).recip()
            }

            player.p.essence = player.p.essence.max(1).pow(j.exp).log10().pow(j.dilate).pow10().add(pps).log10().root(j.dilate).pow10().root(j.exp);
            player.p.essencePS = diff != 0 ? player.p.essence.sub(prev).div(diff) : D(0)
            player.p.bestEssence = Decimal.max(player.p.essence, player.p.bestEssence);
        }

        if (inChallenge('p', 31) || hasUpgrade('q', 16)) {
            player.p.ssChalBest = Decimal.max(player.p.ssChalBest, player.points)
            if (hasUpgrade('p', 31)) {
                player.p.ssPoints = player.p.ssPoints.add(tmp.p.sspGen.mul(diff))
                player.p.ssTotal = player.p.ssTotal.add(tmp.p.sspGen.mul(diff))
            }
        }

        if (inChallenge('p', 41)) {
            player.p.hsChalBest = Decimal.max(player.p.hsChalBest, player.points)
        }
        player.p.hsPoints = player.p.hsPoints.add(tmp.p.hspGen.mul(diff))
        player.p.hsTotal = player.p.hsTotal.add(tmp.p.hspGen.mul(diff))
        player.p.hsBestGalaxies = Decimal.max(player.p.hsBestGalaxies, tmp.p.hspGalaxies)

        if (inChallenge('q', 12) || challengeCompletions('q', 13).gte(1)) {
            // goes backwards because higher dims need to be prioritized
            // ends at 1 because i-1 at 0 crashes (-1 index)
            for (let i = 7; i >= 1; i--) {
                player.p.dimensionAccu[i-1] = player.p.dimensionAccu[i-1].add(
                    player.p.dimensionAccu[i].add(player.p.buyables[61 + i]).mul(tmp.p.buyables[61 + i].effect)
                    .mul(diff).mul(player.globalTS)
                )
            }

            if (hasUpgrade('p', 53)) {
                player.p.dimensionAccu[7] = player.p.dimensionAccu[7].add(
                    player.p.dimensionAccu[0].add(player.p.buyables[61]).mul(tmp.p.buyables[61].effect)
                    .pow(upgradeEffect('p', 53))
                    .mul(diff).mul(player.globalTS)
                )
            }

            player.p.energy = player.p.energy.add(tmp.p.energyPS.mul(diff))
            player.p.totalEnergy = player.p.totalEnergy.add(tmp.p.energyPS.mul(diff))
        }

        if (inChallenge('p', 23)) {
            let loss = [D(2), D(2.5), D(3), D(3.5), D(4)][challengeCompletions('p', 23).floor().min(4).toNumber()]
            if (inChallenge('p', 25)) {
                loss = loss.div(Decimal.pow(3, tmp.p.challenges[25].getDepths))
            }

            player.p.buyable5Clicks = player.p.buyable5Clicks.sub(loss.mul(diff)).max(0)
            if (player.p.buyable5Clicks.eq(0)) {
                player.p.activeChallenge = null
            }
        }
        
        if (hasUpgrade('p', 412)) {
            let gen = upgradeEffect('p', 412).mul(player.globalTS)
            player.p.upg412BP = player.p.upg412BP.add(gen.mul(diff))
        }
        if (hasUpgrade('p', 425)) {
            let gen = tmp.p.tpGain.mul(player.globalTS).mul(diff)

            player.p.treePoints = player.p.treePoints.add(gen)
        }
        
        player.p.buyable5ClickCooldown = Decimal.sub(player.p.buyable5ClickCooldown, diff)
        if (hasUpgrade('l', 16)) {
            let gen = tmp.p.b5ClickMult.mul(player.globalTS).mul(diff)
            player.p.buyable5Clicks = player.p.buyable5Clicks.add(gen).max(0)
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

        if (hasUpgrade('p', 24)) {
            tmp.p.buyables[14].buyMax()
        }

        if (hasUpgrade('q', 12)) {
            tmp.p.buyables[15].buyMax()
        }

        if (hasUpgrade('p', 422)) {
            for (let i = 0; i < 8; i++) {
                tmp.p.buyables[61 + i].buyMax()
            }
        }

        if (hasUpgrade('p', 424)) {
            tmp.p.buyables[51].buyMax()
        }
        
        if (hasUpgrade('q', 23)) {
            tmp.p.buyables[52].buyMax()
        }
        
        if (hasUpgrade('p', 425)) {
            tmp.p.buyables[71].buyMax()
            tmp.p.buyables[72].buyMax()
            tmp.p.buyables[73].buyMax()
        }
        
        if (hasMilestone('q', 3)) {
            tmp.p.buyables[21].buyMax()
            tmp.p.buyables[22].buyMax()
            tmp.p.buyables[23].buyMax()
        }
        
        if (hasMilestone('q', 4)) {
            tmp.p.buyables[31].buyMax()
            tmp.p.buyables[32].buyMax()
            tmp.p.buyables[33].buyMax()
        }
        
        if (hasMilestone('q', 5)) {
            tmp.p.buyables[41].buyMax()
            tmp.p.buyables[42].buyMax()
            tmp.p.buyables[43].buyMax()
        }

    },
    effect(){
        if (inChallenge('p', 31)) {
            return D(1)
        }

        let i = player.p.total
        let j = D(3)
        j = j.add(tmp.p.buyables[41].effect.ppss)
        if (hasMilestone('p', 4)) {
            j = j.add(player.p.buyables[51].sub(4).mul(5))
        }

        i = i.max(0).add(1).log10().add(1).pow(0.6).sub(1).pow10().pow(j)
        return i
    },
    effectDescription(){
        return ` multiplying point gain by &times;${format(tmp.p.effect, 2)}.`
    },
    sspEff() {
        let i = player.p.ssTotal
        let j = player.p.ssChalBest
        i = i.add(1).max(0).pow(j.max(1e5).log(1e5).sqrt()).log10().add(1).pow(0.5).sub(1).pow10()
        return i
    },
    sspGen() {
        if (!(inChallenge('p', 31) || hasUpgrade('q', 16))) {
            return D(0)
        }

        let i = player.points
        i = i.max(1e5).log(1e5).pow(0.95).sub(1).pow10().pow(player.p.ssChalBest.max(1e5).log(1e5))
        
        if (i.gte(1e63)) {
            i = i.log10().div(63).cbrt().sub(1).mul(3).add(1).mul(63).pow10()
        }

        if (i.gte('ee4')) {
            i = i.log10().div(1e4).sqrt().sub(1).mul(2).add(1).mul(1e4).pow10()
        }
        
        if (!hasUpgrade('q', 11)) {
            i = i.mul(tmp.q.generationEff[3])
        }

        if (hasUpgrade('p', 222)) {
            i = i.pow(tmp.p.buyables[15].effect)
        }

        if (hasUpgrade('p', 405)) {
            i = i.pow(upgradeEffect('p', 405))
        }

        if (hasUpgrade('q', 11)) {
            i = i.pow(tmp.q.generationEff[3])
        }

        i = i.mul(player.globalTS)
        return i
    },
    hspGen() {
        let i = inChallenge('q', 13)
            ? player.p.hsChalBest.gt('e3000')
                ? player.p.hsChalBest.log10().div(3000).pow(4)
                : D(0)
            : player.p.hsChalBest.gt('e3e5')
                ? player.p.hsChalBest.log10().div(3e5).pow(12)
                : D(0)

        i = i.pow(tmp.p.buyables[83].effect.add(1))
        
        i = i.mul(tmp.p.buyables[81].effect)
        if (hasUpgrade('p', 403)) {
            i = i.mul(upgradeEffect('p', 403))
        }
        if (hasUpgrade('p', 404)) {
            i = i.mul(upgradeEffect('p', 404))
        }
        if (hasUpgrade('p', 415)) {
            i = i.mul(upgradeEffect('p', 415))
        }
        i = i.pow(challengeCompletions('p', 25).pow_base(1.02))
        if (player.l.petEquipped.includes('triangle')) {
            i = i.pow(tmp.l.petActiveEffs.triangle)
        }
        return i
    },
    hspGalaxyInterval() {
        // 1 = 10x of HSP = +1 galaxy
        // 2 = ~3x of HSP = +1 galaxy

        // every 2x = +1 galaxy
        // 1 / Math.log10(2)
        let i = D(3.321928094887362)
        i = i.div(tmp.p.buyables[82].effect)
        i = i.mul(tmp.l.petPassiveEffs.triangle)
        if (hasUpgrade('q', 22)) {
            i = i.div(upgradeEffect('q', 22))
        }
        return i
    },
    hspGalaxies() {
        if (player.p.hsPoints.lt(1)) {
            return D(0)
        }
        let i = player.p.hsPoints.log10().mul(tmp.p.hspGalaxyInterval)
        if (i.gte(1000)) {
            i = i.div(1000).ln().add(1).mul(1000)
        }
        return i.floor()
    },
    hspGalaxyNextMult() {
        if (player.p.hsPoints.lt(1)) {
            return tmp.p.hspGalaxyInterval.recip().pow10()
        }
        let i = player.p.hsBestGalaxies.add(1)
        if (i.gte(1000)) {
            i = i.div(1000).sub(1).exp().mul(1000)
        }

        let j = player.p.hsBestGalaxies
        if (j.gte(1000)) {
            j = j.div(1000).sub(1).exp().mul(1000)
        }

        // I = 10^(i/x)
        // J = 10^(j/x)
        // I/J
        // 10^(i/x) / 10^(j/x)
        // 10^(i/x - j/x)
        // 10^((i - j) / x)

        return i.sub(j).div(tmp.p.hspGalaxyInterval).pow10()
    },
    hspGalaxyNext() {
        if (player.p.hsPoints.lt(1)) {
            return D(1)
        }
        let i = player.p.hsBestGalaxies.add(1)
        if (i.gte(1000)) {
            i = i.div(1000).sub(1).exp().mul(1000)
        }
        i = i.div(tmp.p.hspGalaxyInterval).pow10()

        return i
    },
    hspGalaxyTotalEffect() {
        return player.p.hsBestGalaxies.pow_base(inChallenge('q', 13) ? 0.999 : 0.9999).recip()
    },
    energyEff() {
        let i = player.p.totalEnergy
        i = i.max(1).log10().mul(0.02).add(1)
        if (!inChallenge('q', 12)) {
            i = i.cbrt()
        }
        if (i.gte(4)) {
            i = i.div(4).sqrt().mul(4)
        }
        return i
    },
    energyPS() {
        return player.p.dimensionAccu[0].add(player.p.buyables[61]).mul(tmp.p.buyables[61].effect).mul(player.globalTS)
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
        let gain = player.points.lt(req) ? new Decimal(0) : player.points.log10().sub(req.log10()).mul(2).add(125).sqrt().mul(2.23606797749979).sub(25).pow10().floor()

        gain = gain.mul(tmp.p.buyables[42].effect.pp)
        gain = gain.mul(tmp.q.effect)
        if (!hasUpgrade('q', 11)) {
            gain = gain.mul(tmp.q.generationEff[1])
        }
        gain = gain.mul(tmp.q.buyables[12].effect)
        if (hasUpgrade('p', 401)) {
            gain = gain.mul(upgradeEffect('p', 401))
        }

        if (hasUpgrade('p', 262)) {
            gain = gain.pow(1.05)
        }
        if (hasUpgrade('p', 273)) {
            gain = gain.pow(upgradeEffect('p', 273))
        }
        gain = gain.pow(challengeCompletions('p', 25).pow_base(1.02))
        if (hasUpgrade('q', 11)) {
            gain = gain.pow(tmp.q.generationEff[1])
        }

        return gain
    },
    getNextAt() {
        let req = tmp.p.getRequire
        let next = tmp.p.getResetGain

        if (hasUpgrade('q', 11)) {
            next = next.root(tmp.q.generationEff[1])
        }
        next = next.root(challengeCompletions('p', 25).pow_base(1.02))
        if (hasUpgrade('p', 273)) {
            next = next.root(upgradeEffect('p', 273))
        }
        if (hasUpgrade('p', 262)) {
            next = next.root(1.05)
        }
        if (hasUpgrade('p', 401)) {
            next = next.div(upgradeEffect('p', 401))
        }
        next = next.div(tmp.q.buyables[12].effect)
        if (!hasUpgrade('q', 11)) {
            next = next.div(tmp.q.generationEff[1])
        }
        next = next.div(tmp.q.effect)
        next = next.div(tmp.p.buyables[42].effect.pp)

        next = next.add(1).floor().log10().add(25).div(2.23606797749979).pow(2).sub(125).div(2).add(req.log10()).pow10()
        return next
    },
    prestigeButtonText(){
        let gain = tmp.p.getResetGain
        let nextAt = tmp.p.getNextAt

        let amt = "You can reset for " + format(gain, 2) + " Prestige Points"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    tpGain() {
        let i;
        if (inChallenge('q', 14)) {
            i = Decimal.gte(player.p.points, 'e2000')
                ? hasUpgrade('p', 425)
                    ? player.p.points.log10().div(2).sub(1000).div(4).pow10().floor()
                    : player.p.points.log10().div(2).root(1.5).sub(100).div(4).pow10().floor()
                : D(0)
        } else {
            i = Decimal.gte(player.p.points, 'e360')
                ? hasUpgrade('p', 425)
                    ? player.p.points.log10().mul(343/360).root(1.5).sub(49).pow10().floor()
                    : player.p.points.log10().mul(10/9).root(2).sub(20).pow10().floor()
                : D(0)
        }

        return i
    },
    tpNext() {
        let i = tmp.p.tpGain.add(1)
        if (inChallenge('q', 14)) {
            i = hasUpgrade('p', 425)
                ? i.log10().mul(4).add(1000).mul(2).pow10()
                : i.log10().mul(4).add(100).pow(1.5).mul(2).pow10()
        } else {
            i = hasUpgrade('p', 425)
                ? i.log10().add(49).pow(1.5).div(343/360).pow10()
                : i.log10().add(20).pow(2).div(10/9).pow10()
        }

        return i;
    },
    totalBP() {
        let BP = tmp.p.buyables[71].effect ?? D(0)
        BP = BP.add(tmp.p.buyables[72].effect ?? D(0))
        BP = BP.add(tmp.p.buyables[73].effect ?? D(0))
        BP = BP.add(player.p.upg412BP)

        return BP;
    },
    bpEffect() {
        let i = tmp.p.totalBP
        i = i.pow_base('e500')

        return i
    },
    b5ClickMult() {
        if (inChallenge('p', 23)) {
            return D(1)
        }

        let i = D(1)
        if (hasUpgrade('p', 223)) {
            i = i.mul(tmp.p.totalBP)
        }
        if (hasUpgrade('p', 233)) {
            i = i.mul(25)
        }
        i = i.mul([1, 1.5, 3, 9, 45, 360][challengeCompletions('p', 23).toNumber()])
        i = i.mul(tmp.l.buyables[22].effect)
        if (player.l.petEquipped.includes('circle')) {
            i = i.mul(tmp.l.petActiveEffs.circle)
        }

        return i
    },
    challenge21Effect() {
        return player.p.challenge21Clicks.div(player.p.challenge21Clicks.add(50))
    },
    challenge22UnlockCost() {
        return Decimal.pow(4, (player.p.challenge22Unlocks ?? []).length).pow_base('ee3')
    },
    doReset() {
        player.points = D(0)

        player.p.timeInP = D(0)
        if (!hasUpgrade('q', 17)) {
            if (hasUpgrade('p', 223)) {
                player.p.buyable5Clicks = player.p.buyable5Clicks.mul(0.8)
            } else {
                player.p.buyable5Clicks = D(0)
            }
        }
        player.p.challenge21Clicks = D(0)

        setBuyableAmount('p', 11, D(0))
        setBuyableAmount('p', 12, D(0))
        setBuyableAmount('p', 13, D(0))
        if (!hasUpgrade('p', 13)) { setBuyableAmount('p', 14, D(0)) }
    },
    tabFormat: {
        // ! NOTE!! IN tabFormat, 'p' DOESN'T WORK !!!
        "Main": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["buyables", [1]],
                "blank",
                ["clickables", [3]],
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
                ["display-text",
                function() { return `Your prestige essence is naturally slowing down by /${format(player.p.essenceReduction, 2)}!` }],
                "blank",
                ["clickables", [4]],
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
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player.p.essence, 2)}</h2> Prestige Essence. (${format(player.p.essencePS, 3)}/sec)` }],
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
                function() { return hasUpgrade('p', 31) ? `You have <h2 style="color: #C0C0C0; font-size: 26px; text-shadow: #C0C0C0 0px 0px 10px;">${format(player.p.ssPoints)}</h2> Super Scaling Points, which multiplies point gain by &times;${format(tmp.p.sspEff, 2)}. (${format(tmp.p.sspGen, 3)}/sec)` : "" }],
                ["display-text",
                function() { return hasUpgrade('p', 31) ? `You gain Super Scaling Points based off of your progress in the Super Scaling challenge. The higher your points, the higher the SSP you gain.` : "" }],
                "blank",
                ["challenges", [3]],
                "blank",
                ["upgrades", [4]],
            ],
            unlocked(){
                return player.p.total.gte(100)
            },
        },
        "Hyper Scaling": {
            content: [
                "main-display",
                ["display-text",
                function() { return `You have <h2 style="color: #C0C0C0; font-size: 26px; text-shadow: #C0C0C0 0px 0px 10px;">${format(player.p.hsPoints)}</h2> Hyper Scaling Points. (${format(tmp.p.hspGen, 3)}/sec)` }],
                ["display-text",
                function() { return `You gain Hyper Scaling Points based off of your progress in the Hyper Scaling challenge.<br>The higher your points, the higher the HSP you gain.` }],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #C0C0C0; font-size: 26px; text-shadow: #C0C0C0 0px 0px 10px;">${format(player.p.hsBestGalaxies)}</h2> intervals (next at ${format(tmp.p.hspGalaxyNext)} HSP), reducing your Basic Buyable cost scaling by -${formatPerc(tmp.p.hspGalaxyTotalEffect, 3)}.` }],
                ["display-text",
                function() { return `Every time your HSP increases by ${format(tmp.p.hspGalaxyNextMult, 2)}&times;, all Basic Buyable cost scaling is decreased by &times;${inChallenge('q', 13) ? 0.999 : 0.9999}.<br>The requirement will begin to scale after ${format(1e3)} intervals!` }],
                "blank",
                ["challenges", [4]],
                "blank",
                ["upgrades", [40, 41, 42]],
                "blank",
                ["buyables", [8]],
            ],
            unlocked(){
                return hasUpgrade('p', 301)
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
                return inChallenge('q', 11) || challengeCompletions('q', 12).gte(1)
            },
        },
        "Dimensions": {
            content: [
                "main-display",
                ["display-text",
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player.p.energy)}</h2> Prestige Energy, which raises point gain by ^${format(tmp.p.energyEff, 3)}. [softcaps at ^4.000] (${format(tmp.p.energyPS, 3)}/sec)` }],
                ["display-text",
                function() { return `Your total Prestige Energy is ${format(player.p.totalEnergy)}.` }],
                "blank",
                ["upgrades", [5, 6]],
                ["buyables", [6, 9]],
            ],
            unlocked(){
                return inChallenge('q', 12) || challengeCompletions('q', 13).gte(1)
            },
        },
        "Tree": {
            content: [
                "main-display",
                ["display-text",
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(player.p.treePoints)}</h2> Tree Points. These can be used to buy Branch Points.` }],
                ["clickables", [1]],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #8000FF; font-size: 26px; text-shadow: #8000FF 0px 0px 10px;">${format(tmp.p.totalBP.sub(player.p.totalBPUsed))}</h2> Branch Points, which multiplies points by &times;${format(tmp.p.bpEffect)}.` }],
                "blank",
                ["buyables", [7]],
                "blank",
                ["microtabs", "TreeThingy"],
            ],
            unlocked(){
                return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1)
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
        },
        "TreeThingy": {
            "Upgrades": {
                content: [
                    ["clickables", [2]],
                    "blank",
                    ["upgrades", [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]],
                ]
            },
            "Challenges": {
                content: [
                    ["challenges", [2]]
                ],
                unlocked(){
                    return hasUpgrade('p', 242) || inChallenge('p', 21)
                },
            }
        }
    },
    milestones: {
        0: {
            requirementDescription: "Rank 1",
            effectDescription: "Weaken point's natural softcap slightly.",
            done() { return player.p.buyables[51].gte(1) }
        },
        1: {
            requirementDescription: "Rank 2",
            effectDescription: "Point Buyable 1's linear cost scaling is reduced by -0.25.",
            done() { return player.p.buyables[51].gte(2) },
            unlocked() { return hasMilestone('p', 0) }
        },
        2: {
            requirementDescription: "Rank 3",
            effectDescription() {
                return `Every Point Buyable 2 adds ${
                    inChallenge('p', 11) 
                        ? "1 free level"
                        : "0.1 free levels"} to Point Buyable 1.`
            },
            done() { return player.p.buyables[51].gte(3) },
            unlocked() { return hasMilestone('p', 1) }
        },
        3: {
            requirementDescription: "Rank 4",
            effectDescription: "Point Buyable 1's quadratic cost scaling is reduced by -0.005.",
            done() { return player.p.buyables[51].gte(4) },
            unlocked() { return hasMilestone('p', 2) }
        },
        4: {
            requirementDescription: "Rank 5",
            effectDescription() { 
                return `Every Rank past 4 adds +5.0 to the prestige point effect exponent.<br>Currently: +${format(player.p.buyables[51].sub(4).max(0).mul(5), 1)} to exp.`
            },
            done() { return player.p.buyables[51].gte(5) },
            unlocked() { return hasMilestone('p', 3) }
        },
        5: {
            requirementDescription: "Rank 6",
            effectDescription: "Point Buyable 2's linear cost scaling is nullified.",
            done() { return player.p.buyables[51].gte(6) },
            unlocked() { return hasMilestone('p', 4) }
        },
        6: {
            requirementDescription: "Rank 7",
            effectDescription: "Prestige Essence's natural softcap is weakened slightly.",
            done() { return player.p.buyables[51].gte(7) },
            unlocked() { return hasMilestone('p', 5) }
        },
        7: {
            requirementDescription: "Rank 8",
            effectDescription() { 
                return inChallenge('q', 11)
                    ? `Point's 2nd softcap is -4% weaker every Rank past 7.<br>Currently: -${formatPerc(player.p.buyables[51].sub(7).max(0).pow_base(1/0.96), 2)} softcap strength.`
                    : `Point's 2nd softcap is -2% weaker every Rank past 7.<br>Currently: -${formatPerc(player.p.buyables[51].sub(7).max(0).pow_base(1/0.98), 2)} softcap strength.`
            },
            done() { return player.p.buyables[51].gte(8) },
            unlocked() { return hasMilestone('p', 6) }
        },
        8: {
            requirementDescription: "Rank 12",
            effectDescription() { 
                return inChallenge('q', 11)
                    ? `PP Buyable 2 is +25.0% more effective every Rank past 11.<br>Currently: +${format(player.p.buyables[51].sub(11).max(0).mul(0.25).add(1).sub(1).mul(100), 1)}% effective`
                    : `PP Buyable 2 is +12.5% more effective every Rank past 11.<br>Currently: +${format(player.p.buyables[51].sub(11).max(0).mul(0.125).add(1).sub(1).mul(100), 1)}% effective`
            },
            done() { return player.p.buyables[51].gte(12) },
            unlocked() { return hasMilestone('p', 7) }
        },
        100: {
            requirementDescription: "Tier 1",
            effectDescription: "Weaken point's natural softcap slightly and eliminate PP Buyable 1's linear cost scaling.",
            done() { return player.p.buyables[52].gte(1) }
        },
        101: {
            requirementDescription: "Tier 2",
            effectDescription() {
                return inChallenge('q', 11)
                    ? "Reduce PP Buyable 9's linear cost scaling to 1.1."
                    : "Reduce PP Buyable 9's linear cost scaling to 1.175."
            },
            done() { return player.p.buyables[52].gte(2) },
            unlocked() { return hasMilestone('p', 100) }
        },
        102: {
            requirementDescription: "Tier 3",
            effectDescription() { 
                return inChallenge('q', 11)
                    ? `Add 1 free level for Point Buyable 4 and PP Buyable 9's effect base is increased by +0.3 every Tier past 2.<br>Currently: +${format(player.p.buyables[52].sub(2).max(0))} free levels, +${format(player.p.buyables[52].sub(2).max(0).mul(0.3), 1)} effect base`
                    : `Add 1 free level for Point Buyable 4 and PP Buyable 9's effect base is increased by +0.1 every Tier past 2.<br>Currently: +${format(player.p.buyables[52].sub(2).max(0))} free levels, +${format(player.p.buyables[52].sub(2).max(0).mul(0.1), 1)} effect base`
            },
            done() { return player.p.buyables[52].gte(3) },
            unlocked() { return hasMilestone('p', 101) }
        },
    },
    buyables: (() => {
        const upgrades = {
            11: {
                type: 0,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(10), D(1.6), D(1.025)]}
                    if (hasUpgrade('p', 41)) {
                        obj.main[1] = D(1.25)
                    }
                    if (hasMilestone('p', 1)) {
                        obj.main[1] = obj.main[1].sub(0.25)
                    }
                    if (hasMilestone('p', 3)) {
                        obj.main[2] = obj.main[2].sub(0.005)
                    }
                    return obj
                },
                unlocked() { return player.bestPoints.gte(10) },
                unavail() {
                    let x = inChallenge('q', 12)
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        // mult to non-free level effectiveness
                        i = i.mul(tmp.p.challenges[41].rewardEffect)

                        i = i.add(tmp.p.buyables[13].effect.free)
                        if (hasMilestone('p', 2)) {
                            i = i.add(player.p.buyables[12].mul(
                                inChallenge('p', 11)
                                    ? 1
                                    : 0.1
                            ))
                        }
                        if (hasUpgrade('p', 15)) {
                            i = i.add(player.p.buyables[31].mul(0.4))
                        }
                        if (challengeCompletions('p', 12).gte(5)) { i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001) }
                        if (hasUpgrade('p', 251)) { i = i.mul(inChallenge('q', 14) ? 1.05 : 1.001) }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    j = D(2)
                    j = j.add(tmp.p.buyables[12].effect)
                    if (hasUpgrade('p', 14)) { j = j.add(upgradeEffect('p', 14)) }
                    j = j.mul(tmp.p.buyables[13].effect.base)
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(9)) { j = j.sub(1).div(3).add(1) }

                    i = Decimal.pow(j, i)

                    if (challengeCompletions('p', 12).gte(8)) { i = i.log10().pow([1, 1.005, 1.010025, 1.015075125][challengeCompletions('p', 12).sub(7).max(0).min(3).toNumber()]).pow10() }
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(20)) { 
                        i = i.log10().pow(0.5).pow10()
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[11])
                    return `&times;${format(currEffect)} point gain.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[11])
                    if (player.p.buyables[11].gte(1e12)) {
                        return `&times;${format(currEffect.root(player.p.buyables[11]), 2)} point gain.` 
                    } else {
                        const nextEffect = this.effect(player.p.buyables[11].add(1))
                        return `&times;${format(nextEffect.div(currEffect), 2)} point gain.` 
                    }
                },
                scaleModifEffective(x) {
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(5)) { x = x.pow(2) }

                    if (challengeCompletions('q', 11).gte(1)) {
                        x = x.mul(0.75)
                    }
                    return x
                },
                scaleModifCost(x) {
                    if (player.p.buyables[31].gt(0)) { x = x.div(tmp.p.buyables[31].effect.up1c) }
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('q', 11).gte(1)) {
                        x = x.div(0.75)
                    }

                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(5)) { x = x.root(2) }
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
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(250), D(2), D(1.05)]}
                    if (hasMilestone('p', 5)) {
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
                preEffect(x, override) {
                    if (this.unavail()) { return D(0) }
                    let i = D(x), j

                    if (!override) {
                        if (hasUpgrade('p', 15)) {
                            i = i.add(player.p.buyables[32].mul(0.4))
                        }
                        if (hasUpgrade('p', 251)) { i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001) }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    j = D(0.25)
                    j = j.add([0, 0.025, 0.055, 0.09, 0.13, 0.175, 0.225, 0.28, 0.34, 0.405, 0.475][challengeCompletions('p', 12).min(10).toNumber()]);
                    i = Decimal.mul(j, i)
                    if (challengeCompletions('p', 12).gte(3)) { i = i.add(1).pow(1.1).sub(1) }

                    i = i.add(1).pow(tmp.p.challenges[31].rewardEffect).sub(1)
                    i = i.add(1).pow(tmp.q.buyables[13].effect).sub(1)
                    if (hasUpgrade('p', 232)) {
                        i = i.add(1).pow(upgradeEffect('p', 232)).sub(1)
                    }
                    // x2, x2.5, x3, x3.5, etc.
                    i = i.add(1).pow(Decimal.factorial(challengeCompletions('p', 12).sub(11).max(-1).add(4)).div(challengeCompletions('p', 12).sub(11).max(-1).pow_base(2)).div(24/2)).sub(1)

                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[12])
                    return  `+${format(currEffect, 3)} Point Buyable 1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[12])
                    if (player.p.buyables[12].gte(1e12)) {
                        return `+${format(currEffect.div(player.p.buyables[12]), 3)} Point Buyable 1 base.` 
                    } else {
                        const nextEffect = this.effect(player.p.buyables[12].add(1))
                        return `+${format(nextEffect.sub(currEffect), 3)} Point Buyable 1 base.` 
                    }
                },
                scaleModifEffective(x) {
                    if (challengeCompletions('p', 12).gte(6)) { x = x.div([1, 1.025, 1.06, 1.12, 1.21, 1.343][challengeCompletions('p', 12).sub(5).max(0).min(5).toNumber()]) }      
                    return x
                },
                // put ?? D(1) as default for 1 because i think some race condition/wrong initalization order is causing that to be undefined, letting it be interpreted as 0
                // and root 0 is undefined for many areas
                scaleModifCost(x) {
                    x = x.pow(tmp.p.buyables[42].effect.up2c ?? D(1))
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('p', 12).gte(6)) { x = x.mul([1, 1.025, 1.06, 1.12, 1.21, 1.343][challengeCompletions('p', 12).sub(5).max(0).min(5).toNumber()]) }      
                    return x
                },
                scaleModifTarCost(x) {
                    x = x.root(tmp.p.buyables[42].effect.up2c ?? D(1))
                    return x
                },
            },
            13: {
                type: 0,
                num: 3,
                costD: {type: 0, exp: 1, main: [D(6), D(1.15), D(1.0005)]},
                unlocked() { return player.bestPoints.gte(1e5) && challengeCompletions('p', 11).gte(1) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(10)) { x = true }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        if (hasUpgrade('p', 15)) {
                            i = i.add(player.p.buyables[33].mul(0.4))
                        }
                        if (challengeCompletions('p', 12).gte(2)) { i = i.mul(1.2) }
                        if (hasUpgrade('p', 251)) { i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001) }
                        i = i.mul(tmp.l.buyables[43].effect)

                        if (inChallenge('p', 41)) {
                            i = i.pow(0.5)
                        }
                    }

                    j = [D(0.5), D(1.02)];
                    if (challengeCompletions('p', 12).gte(4)) { j[1] = j[1].add(0.01) }
                    j[0] = j[0].add(tmp.p.buyables[23].effect.free)

                    i = {free: Decimal.mul(j[0], i), base: Decimal.pow(j[1], i)};
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[13])
                    return `+${format(currEffect.free, 2)} free PB1, &times;${format(currEffect.base, 3)} PB1 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[13])
                    const nextEffect = this.effect(player.p.buyables[13].add(1))
                    return `+${format(nextEffect.free.sub(currEffect.free), 2)} free PB1, &times;${format(nextEffect.base.div(currEffect.base), 3)} PB1 base.` 
                },
                scaleModifEffective(x) {
                    if (hasUpgrade('p', 12)) { x = x.sub(upgradeEffect('p', 12)) }
                    x = x.div(tmp.p.buyables[21].effect.up3s)
                    if (challengeCompletions('q', 12).gte(1)) {
                        x = x.mul(0.9)
                    }

                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('q', 12).gte(1)) {
                        x = x.div(0.9)
                    }
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
                    if (inChallenge('p', 24)) {
                        x = true
                    }
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(10)) { x = true }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        if (hasMilestone('p', 102)) {
                            i = i.add(player.p.buyables[52].sub(2).max(0))
                        }
                        if (hasUpgrade('p', 272)) {
                            i = i.add(2)
                        }
                        if (hasUpgrade('p', 251)) { i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001) }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    j = D(1.01)
                    j = j.add(tmp.p.buyables[33].effect.up4b)
                    i = Decimal.pow(j, i)

                    if (inChallenge('q', 11)) {
                        if (Decimal.gte(i, 2)) {
                            i = i.div(2).cbrt().mul(2)
                        }
                    }

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
                    if (x.gte(100)) {
                        let pow = D(1)
                        if (hasUpgrade('q', 23)) {
                            pow = pow.mul(upgradeEffect('q', 23))
                        }
                        x = x.div(100).root(pow).sub(1).mul(pow).exp().mul(100)
                    }
                    x = x.div(tmp.l.petPassiveEffs.square)
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    x = x.mul(tmp.l.petPassiveEffs.square)
                    if (x.gte(100)) {
                        let pow = D(1)
                        if (hasUpgrade('q', 23)) {
                            pow = pow.mul(upgradeEffect('q', 23))
                        }
                        x = x.div(100).ln().div(pow).add(1).pow(pow).mul(100)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            15: {
                type: 0,
                num: 5,
                costD: {type: 0, exp: 1, main: [D(1000), D(1.2), D(1.005)]},
                unlocked() { return hasUpgrade('p', 201) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(10)) { x = true }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        if (hasUpgrade('p', 251)) { i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001) }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    if (hasUpgrade('p', 212)) {
                        j = player.p.buyable5Clicks.mul(0.4)
                    } else {
                        j = player.p.timeInP
                        if (hasUpgrade('p', 281)) {
                            j = j.mul(2)
                        }
                        j = j.mul([1, 1.5, 3, 9, 45, 360][challengeCompletions('p', 23).toNumber()])
                    }

                    j = j.mul(i).div(60).add(1).ln().mul(0.05)

                    if (!inChallenge('q', 13)) {
                        j = j.mul(0.004)
                    }
                    if (hasUpgrade('p', 211)) {
                        j = j.mul(hasUpgrade('p', 212) && hasUpgrade('p', 414) ? 1 : 1.3)
                    }
                    if (hasUpgrade('p', 212)) {
                        j = j.mul(hasUpgrade('p', 211) && hasUpgrade('p', 414) ? 1 : 1.2)
                    }

                    i = Decimal.mul(j, i)
                    i = i.add(1)
                    if (inChallenge('p', 23)) {
                        i = i.sub(1)
                    }

                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[15])
                    return `^${format(currEffect, 4)} points.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[15])
                    const nextEffect = this.effect(player.p.buyables[15].add(1))
                    return `+^${format(nextEffect.sub(currEffect), 4)} point gain.`
                },
                scaleModifEffective(x) {
                    if (player.l.petEquipped.includes('square')) {
                        x = x.div(tmp.l.petActiveEffs.square)
                    }
                    return x
                },
                scaleModifCost(x) {
                    if (hasUpgrade('p', 243)) {
                        x = x.pow(upgradeEffect('p', 243))
                    }
                    return x
                },
                scaleModifTarEff(x) {
                    if (player.l.petEquipped.includes('square')) {
                        x = x.mul(tmp.l.petActiveEffs.square)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    if (hasUpgrade('p', 243)) {
                        x = x.root(upgradeEffect('p', 243))
                    }
                    return x
                },
            },
            21: {
                type: 1,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(10), D(10**0.5), D(10**0.005)]}
                    if (hasMilestone('p', 100)) {
                        obj.main[1] = D(1)
                    }
                    return obj
                },
                unlocked() { return player.p.bestEssence.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[61] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[0]
                                : player.p.buyables[61]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[22] ?? D(0)).mul(0.01))
                            i = i.add((player.p.buyables[31] ?? D(0)).mul(0.01))
                        }

                        i = i.mul(tmp.p.buyables[23].effect.peu1)
                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(1)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

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
                    return `&times;${format(currEffect.ppe, 2)} Essence, -${formatPerc(currEffect.up3s)} Point Buyable 3 scaling.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[21])
                    const nextEffect = this.effect(player.p.buyables[21].add(1))
                    return `&times;${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence, -${formatPerc(nextEffect.up3s.div(currEffect.up3s))} Point Buyable 3 scaling.` 
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
                unlocked() { return player.p.bestEssence.gte(10) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j
                    
                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[62] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[1]
                                : player.p.buyables[62]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[23] ?? D(0)).mul(0.01))
                            i = i.add((player.p.buyables[32] ?? D(0)).mul(0.01))
                        }

                        if (hasMilestone('p', 8)) {
                            i = i.mul(player.p.buyables[51].sub(11).max(0).mul(inChallenge('q', 11) ? 0.25 : 0.125).add(1))
                        }
                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(1)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }
                    
                    j = D(0.75); // less = it slows down less
                    if (Decimal.lt(i, 1)) { return {exp: D(0), pps: D(1)}; }
                    i = {
                        exp: i.ln().mul(j).add(1).root(j).mul(0.5),
                        pps: player.p.essence.add(1).pow(i.mul(0.25).add(1).ln()).log10().pow(i.ln().mul(0.01).add(1)).pow10()
                    };
                    if (i.exp.gte(10)) {
                        i.exp = i.exp.log10().mul(10)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[22])
                    return `+${format(currEffect.exp, 2)} Essence exponent (&times;${format(player.p.total.add(1).mul(2).pow(currEffect.exp).div(Decimal.pow(2, currEffect.exp)), 2)} Essence), Essence boosts points by ${format(currEffect.pps, 2)}&times;.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[22])
                    const nextEffect = this.effect(player.p.buyables[22].add(1))
                    return `+${format(nextEffect.exp.sub(currEffect.exp), 2)} Essence exponent (&times;${format(player.p.total.add(1).mul(2).pow(nextEffect.exp.sub(currEffect.exp)).div(Decimal.pow(2, nextEffect.exp.sub(currEffect.exp))), 2)} Essence), Essence boosts points by ${format(nextEffect.pps.div(currEffect.pps), 2)}&times;.` 
                },
                scaleModifEffective(x) {
                    if (x.gte(10000)) {
                        let pow = D(1)
                        if (hasUpgrade('q', 21)) {
                            pow = pow.mul(upgradeEffect('q', 21))
                        }
                        x = x.div(10000).root(pow).sub(1).mul(pow).exp().mul(10000)
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (x.gte(10000)) {
                        let pow = D(1)
                        if (hasUpgrade('q', 21)) {
                            pow = pow.mul(upgradeEffect('q', 21))
                        }
                        x = x.div(10000).ln().div(pow).add(1).pow(pow).mul(10000)
                    }
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
                unlocked() { return player.p.bestEssence.gte(100) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[63] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[2]
                                : player.p.buyables[63]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[33] ?? D(0)).mul(0.01))
                        }

                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(2)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    i = {
                        peu1: i.div(10).add(1).ln().add(1),
                        free: i.add(10).mul(100).cbrt().div(20).sub(0.5).mul(3)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[23])
                    return `PP Buyable 1 is ${format(currEffect.peu1.sub(1).mul(100))}% more effective, +${format(currEffect.free, 2)} Point Buyable 3 Free base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[23])
                    const nextEffect = this.effect(player.p.buyables[23].add(1))
                    return `PP Buyable 1 is ${format(nextEffect.peu1.div(currEffect.peu1).sub(1).mul(100), 2)}% more effective, +${format(nextEffect.free.sub(currEffect.free), 2)} Point Buyable 3 Free base.` 
                },
                scaleModifEffective(x) {
                    if (x.gte(1e6)) {
                        let pow = D(1)
                        if (hasUpgrade('q', 21)) {
                            pow = pow.mul(upgradeEffect('q', 21))
                        }
                        x = x.div(1e6).root(pow).sub(1).mul(pow).exp().mul(1e6)
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (x.gte(1e6)) {
                        let pow = D(1)
                        if (hasUpgrade('q', 21)) {
                            pow = pow.mul(upgradeEffect('q', 21))
                        }
                        x = x.div(1e6).ln().div(pow).add(1).pow(pow).mul(1e6)
                    }
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
                unlocked() { return player.p.bestEssence.gte(1e4) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 24)) {
                        x = true
                    }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)
                    
                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[64] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[3]
                                : player.p.buyables[64]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        i = i.add(Decimal.mul([0, 25, 75, 150, 250, 400][challengeCompletions('p', 24).toNumber()], player.p.buyables[14]))
                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[32] ?? D(0)).mul(0.01))
                            i = i.add((player.p.buyables[41] ?? D(0)).mul(0.01))
                        }
                        
                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(2)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }
                    
                    if (Decimal.lt(i, 1)) { return {ppe: D(1), up1c: D(1)}; }
                    i = {
                        ppe: player.points.add(1).log10().add(1).pow(i.div(10).add(1).sqrt().sub(1).mul(20)),
                        up1c: Decimal.pow(20, i.pow(1.1))
                    };
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[31])
                    return `&times;${format(currEffect.ppe, 2)} Essence from Points, Point Buyable 1's cost is divided by ${format(currEffect.up1c, 2)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[31])
                    const nextEffect = this.effect(player.p.buyables[31].add(1))
                    return `&times;${format(nextEffect.ppe.div(currEffect.ppe), 2)} Essence from Points, Point Buyable 1's cost is divided by ${format(nextEffect.up1c.div(currEffect.up1c), 2)}.` 
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
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[65] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[4]
                                : player.p.buyables[65]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[33] ?? D(0)).mul(0.01))
                            i = i.add((player.p.buyables[42] ?? D(0)).mul(0.01))
                        }

                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(3)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    i = {
                        ppu1: i.add(1).ln().add(1).pow(0.9).sub(1).exp().sub(1).div(8.34),
                        pts: i.mul(0.03).add(1).ln().add(1).cbrt()
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[32])
                    return `+${format(currEffect.ppu1, 3)} PP Buyable 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(currEffect.pts, 3)} slower.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[32])
                    const nextEffect = this.effect(player.p.buyables[32].add(1))
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
                unlocked() { return player.p.bestEssence.gte(1e8) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(10)) { x = true }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[66] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[5]
                                : player.p.buyables[66]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free).max(1).ln())

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[43] ?? D(0)).mul(0.01))
                        }

                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(3)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    i = {
                        ppe: Decimal.pow(1.01, i),
                        up4b: i.mul(0.1).add(1).ln().mul(0.02)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[33])
                    return `^${format(currEffect.ppe, 4)} Essence gain, +${format(currEffect.up4b, 4)} Point Buyable 4 base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[33])
                    const nextEffect = this.effect(player.p.buyables[33].add(1))
                    return `^${format(nextEffect.ppe.div(currEffect.ppe), 4)} Essence gain, +${format(nextEffect.up4b.sub(currEffect.up4b), 4)} Point Buyable 4 base.`
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
                unlocked() { return player.p.bestEssence.gte(1e10) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)
                    
                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[67] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[6]
                                : player.p.buyables[67]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[42] ?? D(0)).mul(0.01))
                        }
                        
                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(4)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }
                    
                    if (Decimal.lt(i, 1)) { return {ess: D(1), ppss: D(0)}; }
                    if (challengeCompletions('p', 12).gte(19)) {
                        i = {
                            ess: i.mul(0.01).add(1).ln().add(1).pow(2/3),
                            ppss: i
                        }
                    } else {
                        i = {
                            ess: i.mul(0.01).add(1).ln().add(1).sqrt(),
                            ppss: sumHarmonicSeries(i).mul(0.25)
                        }
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
                unlocked() { return player.p.bestEssence.gte(1e12) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {
                        i = i.add(tmp.p.buyables[43].effect)
                        i = i.add((player.p.buyables[68] ?? D(0)).eq(0)
                            ? D(0)
                            : (hasUpgrade('l', 25)
                                ? player.p.dimensionAccu[7]
                                : player.p.buyables[68]
                                ).max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))

                        if (challengeCompletions('q', 13).gte(1)) {
                            i = i.add((player.p.buyables[43] ?? D(0)).mul(0.01))
                        }

                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(4)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    if (challengeCompletions('p', 12).gte(19)) {
                        i = {
                            pp: i.pow10(),
                            up2c: i.mul(0.05).add(1).ln().add(1).pow(2).recip()
                        }
                    } else {
                        i = {
                            pp: i.add(1).pow(2).mul(0.05).add(0.95),
                            up2c: i.mul(0.05).add(1).ln().add(1).recip()
                        }
                    }

                    if (hasUpgrade('p', 283)) {
                        i.pp = i.pp.pow(25)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[42])
                    return `Prestige Point gain is multiplied by ${format(currEffect.pp, 2)}&times;, and Point Buyable 2's cost is raised ^${format(currEffect.up2c, 3)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[42])
                    const nextEffect = this.effect(player.p.buyables[42].add(1))
                    return `Prestige Point gain is multiplied by ${format(nextEffect.pp.div(currEffect.pp), 2)}&times;, and Point Buyable 2's cost is raised ^${format(nextEffect.up2c.div(currEffect.up2c), 3)}.` 
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
                    if (hasMilestone('p', 101)) {
                        obj.main[1] = inChallenge('q', 11) 
                            ? D(1.1)
                            : D(1.175)
                    }
                    return obj
                },
                unlocked() { return player.p.bestEssence.gte(1e15) },
                unavail() {
                    let x = false
                    if (inChallenge('p', 12) && challengeCompletions('p', 12).gte(10)) { x = true }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)
                    if (!override) {
                        if (hasUpgrade('p', 52)) {
                            i = i.add((player.p.buyables[69] ?? D(0)).eq(0) ? D(0) : player.p.buyables[69   ].max(1).log10().add(1).mul(tmp.p.buyables[69].effect.free))
                        }
                        i = i.mul(challengeCompletions('p', 21).mul(inChallenge('q', 13) ? 0.05 : 0.001).add(1))
                        if (inChallenge('p', 21)) {
                            i = i.mul(tmp.p.challenge21Effect)
                        }
                        if (hasUpgrade('p', 252)) {
                            i = i.mul(inChallenge('q', 13) ? 1.05 : 1.001)
                        }
                        if (challengeCompletions('p', 22).gte(5)) {
                            i = i.mul(inChallenge('q', 13) ? 1.1 : 1.002)
                        }
                        i = i.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(0.2)
                    if (hasMilestone('p', 102)) {
                        j = j.add(player.p.buyables[52].sub(2).max(0).mul(inChallenge('q', 11) ? 0.3 : 0.1))
                    }
                    
                    i = Decimal.mul(i, j)
                    if (challengeCompletions('p', 12).gte(20)) {
                        i = i.pow(1.01)
                    }
                    return i;
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[43])
                    return `All previous PP Buyables gain +${format(currEffect, 1)} free levels.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[43])
                    const nextEffect = this.effect(player.p.buyables[43].add(1))
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
                get costD() {
                    return inChallenge('q', 11) && !inChallenge('q', 14)
                            ? {type: 1, exp: 1, main: [D(4),     D(1.2), D(1.1)]}
                            : {type: 1, exp: 1, main: [D(10000), D(1.2), D(1.2)]}
                },
                unlocked() { return inChallenge('q', 11) || challengeCompletions('q', 12).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)
                    return i;
                },
                dispEffect() {
                    return `Reset all prior prestige progress in order to gain boosts. Check Rank Milestones for boost information.`
                },
                dispEffBase() {
                    return `Check Rank Milestones...`
                },
                scaleModifEffective(x) {
                    if (hasUpgrade('p', 411)) {
                        x = x.div(upgradeEffect('p', 411))
                    }
                    if (challengeCompletions('p', 12).gte(12)) {
                        x = x.mul(0.95)
                    }
                    return x
                },
                scaleModifCost(x) {
                    if (hasUpgrade('p', 231)) {
                        x = x.pow(upgradeEffect('p', 231))
                    }
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('p', 12).gte(12)) {
                        x = x.div(0.95)
                    }
                    if (hasUpgrade('p', 411)) {
                        x = x.mul(upgradeEffect('p', 411))
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    if (hasUpgrade('p', 231)) {
                        x = x.root(upgradeEffect('p', 231))
                    }
                    return x
                },
            },
            52: {
                type: 2,
                num: 2,
                costD: {type: 0, exp: -1, main: [D(1e8), D(1e2), D(1e1)]},
                unlocked() { return inChallenge('q', 11) || challengeCompletions('q', 12).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)
                    return i;
                },
                dispEffect() {
                    return `Reset all prior prestige progress in order to gain boosts. Check Tier Milestones for boost information.`
                },
                dispEffBase() {
                    return `Check Tier Milestones...`
                },
                scaleModifEffective(x) {
                    if (challengeCompletions('p', 12).gte(13)) {
                        x = x.mul(0.95)
                    }
                    return x
                },
                scaleModifCost(x) {
                    if (hasUpgrade('p', 234)) {
                        x = x.sub(upgradeEffect('p', 234))
                    }
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('p', 12).gte(13)) {
                        x = x.div(0.95)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    if (hasUpgrade('p', 234)) {
                        x = x.add(upgradeEffect('p', 234))
                    }
                    return x
                },
            },
            ...(() => {
                const obj = {};
                for (let i = 0; i < 8; i++) {
                    obj[61 + i] = {
                        type: 3,
                        num: i + 1,
                        get costD() {
                            let obj = {
                                type: 0, exp: 0, 
                                main: [
                                    [D(1e60), D(100),  D(1e5), D(1e9), D(1e15), D(1e21), D(1e30), D(1e45)][i],
                                    [D(100) , D(10),   D(100), D(1e3), D(1e4),  D(1e6),  D(1e8),  D(1e12)][i],
                                    [D(1.04), D(1.05), D(1.1), D(1.2), D(1.5),  D(2),    D(5),    D(10)][i]
                                ]
                            }

                            if (i === 0) {
                                if (!inChallenge('q', 12) || inChallenge('q', 14)) {
                                    obj.exp = 1
                                }
                                if (inChallenge('q', 14)) {
                                    obj.main[0] = D(3000)
                                    obj.main[1] = D(1.01)
                                    obj.main[2] = D(1)
                                } else if (!inChallenge('q', 12)) {
                                    obj.main[0] = D(7000)
                                    obj.main[1] = D(1.05)
                                    obj.main[2] = D(1.001)
                                    if (hasUpgrade('p', 54)) {
                                        obj.main[2] = D(1)
                                    }
                                }
                            }

                            return obj

                        },
                        unlocked() { return (i === 0 || (player.p.buyables[60 + i] ?? D(0)).gte(1)) && (inChallenge('q', 12) || challengeCompletions('q', 13).gte(1)) },
                        unavail() {
                            let x = false
                            return x
                        },
                        preEffect(x, override) {
                            let eff = D(x)

                            if (!override) {
                                if (hasUpgrade('l', 23)) {
                                    eff = eff.add(player.l.buyables[11 + i].eq(0) ? D(0) : player.l.buyables[11 + i].max(1).log10().add(1).mul(upgradeEffect('l', 23)))
                                }
                            }

                            let j = D(2)
                            if (hasUpgrade('p', 51)) {
                                j = j.add(upgradeEffect('p', 51))
                            }
                            if (inChallenge('q', 14)) {
                                j = j.add(1)
                            }
                            if (hasUpgrade('l', 14)) {
                                j = j.add(upgradeEffect('l', 14))
                            }
                            if (hasUpgrade('p', 61)) {
                                j = j.mul(upgradeEffect('p', 61))
                            }
                            
                            eff = Decimal.pow(j, eff.sub(1).max(0))

                            eff = eff.mul(tmp.p.buyables[69].effect.mult ?? D(1))
                            if (hasUpgrade('l', 12)) {
                                eff = eff.mul(upgradeEffect('l', 12))
                            }
                            eff = eff.mul(tmp.l.energyEff.prest)

                            if (hasUpgrade('q', 15)) {
                                eff = eff.pow(upgradeEffect('q', 15))
                            }

                            eff = eff.max(1).log10().pow(tmp.p.buyables[91].effect.dimDilate).pow10()
                            return eff;
                        },
                        dispEffect() {
                            const currEffect = this.effect(player.p.buyables[61 + i])
                            return `This dimension's multiplier is increased by &times;${format(currEffect, 1)}.`
                        },
                        dispEffBase() {
                            const currEffect = this.effect(player.p.buyables[61 + i])
                            const nextEffect = this.effect(player.p.buyables[61 + i].add(1))
                            return `This dimension's multiplier is increased by &times;${format(nextEffect.div(currEffect), 1)}.` 
                        },
                        scaleModifEffective(x) {
                            if (hasUpgrade('p', 64)) {
                                x = x.div(tmp.p.hspGalaxyTotalEffect)
                            }
                            if (challengeCompletions('p', 12).gte(17)) {
                                x = x.mul(0.95)
                            }
                            return x
                        },
                        scaleModifCost(x) {
                            return x
                        },
                        scaleModifTarEff(x) {
                            if (challengeCompletions('p', 12).gte(17)) {
                                x = x.div(0.95)
                            }
                            if (hasUpgrade('p', 64)) {
                                x = x.mul(tmp.p.hspGalaxyTotalEffect)
                            }
                            return x
                        },
                        scaleModifTarCost(x) {
                            return x
                        },
                    }
                }
                return obj
            })(),
            69: {
                type: 3,
                num: 9,
                get costD() {
                    let obj = {type: 0, exp: 1, main: [D(25), D(1.2), D(1.002)]}
                    if (hasUpgrade('p', 55)) {
                        obj.main[1] = D(1.15)
                    }
                    return obj
                },
                unlocked() { return inChallenge('q', 12) || challengeCompletions('q', 13).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    let j = D(4)
                    if (hasUpgrade('p', 55)) {
                        j = j.add(upgradeEffect('p', 55))
                    }

                    i = {
                        mult: Decimal.pow(j, i),
                        free: hasUpgrade('p', 63) && i.gte(20)
                            ? i.sub(12).mul(0.4)
                            : sumHarmonicSeries(i.max(0).add(1))
                    }
                    i.mult = i.mult.max(1).log10().pow(tmp.p.buyables[91].effect.enhancerDilate).pow10()
                    return i;
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[69])
                    return `Reset dimension progress for a ${format(currEffect.mult, 1)}&times; mult to dimensions, and every OoM of a dimension bought adds ${format(currEffect.free, 2)} free levels to their respective Prestige Essence buyable. (for PD6, it is ln()'d)`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[69])
                    const nextEffect = this.effect(player.p.buyables[69].add(1))
                    return `Reset dimension progress for a ${format(nextEffect.mult.div(currEffect.mult), 1)}&times; mult to dimensions, and every OoM of a dimension bought adds ${format(nextEffect.free.sub(currEffect.free), 3)} free levels to their respective Prestige Essence buyable. (for PD6, it is ln()'d)`
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
            ...(() => {
                const obj = {};
                for (let i = 0; i < 3; i++) {
                    obj[71 + i] = {
                        type: 4,
                        num: i + 1,
                        get costD() {
                            if (inChallenge('q', 14)) {
                                return { type: 0, exp: i === 2 ? 0 : 1, main: [
                                    [D(1e4),  D(1000), D(1)][i],
                                    [D(1.2),  D(1.1),  D(1.5)][i],
                                    [D(1.01), D(1.01), D(1.01)][i]
                                ]}
                            }
                            return { type: 0, exp: 0, main: [
                                [D('e10000'), D('e400'), D(1)][i],
                                [D('e2000'),  D('e50'),  D(2)][i],
                                [D(1e100),    D(10),     D(1.02)][i]
                            ]}
                        },
                        unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
                        unavail() {
                            let x = false
                            return x
                        },
                        preEffect(x, override) {
                            let eff = D(x)

                            return eff;
                        },
                        dispEffect() {
                            const currEffect = this.effect(player.p.buyables[71 + i])
                            return `Gain +${format(currEffect)} Branch Points.`
                        },
                        dispEffBase() {
                            const currEffect = this.effect(player.p.buyables[71 + i])
                            const nextEffect = this.effect(player.p.buyables[71 + i].add(1))
                            return `Gain +${format(nextEffect.sub(currEffect))} Branch Points.`
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
                }
                return obj
            })(),
            81: {
                type: 5,
                num: 1,
                costD: {type: 0, exp: 0, main: [D(30), D(3), D(1.02)]},
                unlocked() { return hasUpgrade('p', 301) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {

                    }

                    let j = D(1.5)
                    if (hasUpgrade('l', 14)) {
                        j = j.add(upgradeEffect('l', 14))
                    }

                    i = Decimal.pow(j, i)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[81])
                    return `Multiply Hyper Scaling Point gain by &times;${format(currEffect, 2)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[81])
                    const nextEffect = this.effect(player.p.buyables[81].add(1))
                    return `Multiply Hyper Scaling Point gain by &times;${format(nextEffect.div(currEffect), 2)}.`
                },
                scaleModifEffective(x) {
                    if (challengeCompletions('p', 12).gte(14)) {
                        x = x.mul(0.95)
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('p', 12).gte(14)) {
                        x = x.div(0.95)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            82: {
                type: 5,
                num: 2,
                costD: {type: 0, exp: 1, main: [D(3), D(1.333), D(1.01)]},
                unlocked() { return hasUpgrade('p', 301) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {

                    }

                    let j = D(0.95)
                    i = Decimal.pow(j, i)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[82])
                    return `Reduce the HSP interval by ^${format(currEffect, 3)}.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[82])
                    const nextEffect = this.effect(player.p.buyables[82].add(1))
                    return `Reduce the HSP interval by ^${format(nextEffect.div(currEffect), 3)}.`
                },
                scaleModifEffective(x) {
                    if (challengeCompletions('p', 12).gte(14)) {
                        x = x.mul(0.95)
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('p', 12).gte(14)) {
                        x = x.div(0.95)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            83: {
                type: 5,
                num: 3,
                costD: {type: 0, exp: 1, main: [D(5), D(1.2), D(1.02)]},
                unlocked() { return hasUpgrade('p', 301) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {

                    }

                    let j = D(inChallenge('q', 13) ? 0.25 : 0.1)
                    i = Decimal.mul(j, i)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[83])
                    return `Point to HSP generation speed is raised by +^${format(currEffect, 2)}. (&times;${format(player.p.hsChalBest.log10().div(inChallenge('q', 13) ? 3000 : 3e5).pow(inChallenge('q', 13) ? 4 : 12).pow(currEffect), 1)} to HSP gain)` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[83])
                    const nextEffect = this.effect(player.p.buyables[83].add(1))
                    return `Point to HSP generation speed is raised by +^${format(nextEffect.sub(currEffect), 2)}.  (&times;${format(player.p.hsChalBest.log10().div(inChallenge('q', 13) ? 3000 : 3e5).pow(inChallenge('q', 13) ? 4 : 12).pow(nextEffect.sub(currEffect)), 1)} to HSP gain)`
                },
                scaleModifEffective(x) {
                    if (challengeCompletions('p', 12).gte(14)) {
                        x = x.mul(0.95)
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (challengeCompletions('p', 12).gte(14)) {
                        x = x.div(0.95)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            91: {
                type: 3,
                num: 10,
                costD: {type: 0, exp: 0, main: [D(160), D(1.25), D(1.001)]},
                unlocked() { return hasUpgrade('p', 65) || player.p.buyables[91].gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x)

                    if (!override) {

                    }

                    i = {
                        dimDilate: i.mul(0.005).add(1),
                        enhancerDilate: i.mul(0.15).add(1)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.p.buyables[91])
                    return `Reset previous dimension progress to dilate multiplier from buying dimensions by ^${format(currEffect.dimDilate, 3)} and increase Prestige Enhancer's mult by ^${format(currEffect.enhancerDilate, 2)} to the exponent.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.p.buyables[91])
                    const nextEffect = this.effect(player.p.buyables[91].add(1))
                    return `Reset previous dimension progress to dilate multiplier from buying dimensions by +^${format(nextEffect.dimDilate.sub(currEffect.dimDilate), 3)} and increase Prestige Enhancer's mult by +^${format(nextEffect.enhancerDilate.sub(currEffect.enhancerDilate), 2)} to the exponent.`
                },
                scaleModifEffective(x) {
                    if (x.gte(9)) {
                        x = x.div(9).pow(2).sub(1).exp().mul(9)
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (x.gte(9)) {
                        x = x.div(9).ln().add(1).root(2).mul(9)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
        };

        // ! NOTE!! 'p' doesn't work in the custom buyable script TwT
        // use upgrade.layer instead
        for (const upgrade of Object.values(upgrades)) {
            upgrade.effect = (x) => {
                if (upgrade.type === 1) {
                    if (disabledPEB.includes(upgrade.num)) {
                        return upgrade.preEffect(D(0), true)
                    }
                    if (inChallenge(upgrade.layer, 22)) {
                        if (!player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                            return upgrade.preEffect(D(0), true)
                        }
                    }
                }

                if (upgrade.unavail()) { 
                    return upgrade.preEffect(D(0), true)
                }
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected as input in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }

                let eff = upgrade.preEffect(D(x), false)
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected as effect in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }
                return eff
            }

            upgrade.cost = (x) => {
                if (upgrade.unavail()) { return D(Infinity) }
                if (upgrade.type === 1) {
                    if (inChallenge(upgrade.layer, 22)) {
                        if (!player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                            return tmp[upgrade.layer].challenge22UnlockCost
                        }
                    }
                }

                let i, j, k;
                j = x
                k = upgrade.costD.main

                j = upgrade.scaleModifEffective(j)

                if (upgrade.type === 1) {
                    if (hasUpgrade(upgrade.layer, 45)) {
                        j = j.div(upgradeEffect(upgrade.layer, 45))
                    }
                    if (hasUpgrade(upgrade.layer, 413)) {
                        j = j.div(upgradeEffect(upgrade.layer, 413))
                    }
                }

                if (upgrade.type === 0) {
                    if (hasUpgrade(upgrade.layer, 43)) {
                        j = j.div(upgradeEffect(upgrade.layer, 43))
                    }
                    j = j.div(tmp[upgrade.layer].hspGalaxyTotalEffect)
                }

                if (inChallenge(upgrade.layer, 31) && upgrade.type === 0) { 
                    j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp[upgrade.layer].challenges[31].getDepths)).sub(1).pow10().sub(1).div(2) 
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
                    x = player[upgrade.layer].essence;
                    if (inChallenge(upgrade.layer, 22)) {
                        if (!player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                            return D(-1e-12)
                        }
                    }
                }
                if (upgrade.type === 2) {
                    if (upgrade.num === 1) {
                        x = player.points
                    } else {
                        x = player[upgrade.layer].buyables[50 + upgrade.num - 1];
                    }
                }
                if (upgrade.type === 3) {
                    if (upgrade.num === 1) {
                        x = player[upgrade.layer].points
                    } else {
                        if (upgrade.num === 10) {
                            x = player[upgrade.layer].buyables[68]
                        } else {
                            x = player[upgrade.layer].energy;
                        }
                    }
                }
                if (upgrade.type === 4) {
                    if (upgrade.num === 1) {
                        x = player.points
                    }
                    if (upgrade.num === 2) {
                        x = player[upgrade.layer].points
                    }
                    if (upgrade.num === 3) {
                        x = player[upgrade.layer].treePoints
                    }
                }
                if (upgrade.type === 5) {
                    x = player[upgrade.layer].hsPoints
                }
                
                if (x.lt(upgrade.costD.main[0].layeradd10(upgrade.costD.exp))) { return D(-1e-12) }

                let i, j;
                i = D(x)
                j = upgrade.costD.main
                if (Decimal.isNaN(i)) {
                    throw new Error(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected in target resource!`)
                }
                i = upgrade.scaleModifTarCost(i)

                if (Decimal.isNaN(i)) {
                    console.info(`PROBLEM FUNCTION:`)
                    console.info(upgrade.scaleModifTarCost)
                    throw new Error(`[Layer: p, Type: buyable, ID: ${upgrade.id}]NaN detected in target of id${upgrade.id} after modifier target cost!`)
                }
                i = i.layeradd10(-upgrade.costD.exp)

                if (Decimal.isNaN(i)) {
                    // it's likely only NaN because the value is too low and the amount of logs would make it NaN
                    // or something earlier up has caused crap to happen, make it default into a 0 value
                    console.warn(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} before scaling!`)
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
                    console.warn(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after main scaling! (main scaling causing NaN?)`)
                    return D(0)
                }

                if (inChallenge(upgrade.layer, 31) && upgrade.type === 0) { 
                    i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp[upgrade.layer].challenges[31].getDepths)).sub(1).pow10().sub(1) 
                }

                if (upgrade.type === 0) {
                    i = i.mul(tmp[upgrade.layer].hspGalaxyTotalEffect)
                    if (hasUpgrade(upgrade.layer, 43)) {
                        i = i.mul(upgradeEffect(upgrade.layer, 43))
                    }
                }
                if (upgrade.type === 1) {
                    if (hasUpgrade(upgrade.layer, 413)) {
                        i = i.mul(upgradeEffect(upgrade.layer, 413))
                    }
                    if (hasUpgrade(upgrade.layer, 45)) {
                        i = i.mul(upgradeEffect(upgrade.layer, 45))
                    }
                }

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after modifers before scaleModifTarEff! (modifiers causing NaN?)`)
                    return D(0)
                }

                i = upgrade.scaleModifTarEff(i)

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: p, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after scaleModifTarEff! (scaleModifTarEff causing NaN?)`)
                    return D(0)
                }

                return i
            }

            upgrade.title = () => { 
                if (upgrade.type === 0) {
                    return `Point Buyable ${upgrade.num}` 
                }
                if (upgrade.type === 1) {
                    return `PP Buyable ${upgrade.num}` 
                }
                if (upgrade.type === 2) {
                    return `${[null, "Rank", "Tier", "Tetr"][upgrade.num]}s` 
                }
                if (upgrade.type === 3) {
                    if (upgrade.num === 10) {
                        return `Prestige Galaxy`
                    }
                    if (upgrade.num === 9) {
                        return `Prestige Enhancer`
                    }
                    return `Prestige Dimension ${upgrade.num}`
                }
                if (upgrade.type === 5) {
                    return `Hyper Scaling Buyable ${upgrade.num}`
                }
            },

            upgrade.stupidHack = () => {
                return shiftDown
            }

            upgrade.display = () => {
                // console.log(`%cbuyable id ${upgrade.id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
                let txt;
                if (upgrade.type === 4) {
                    if (upgrade.num === 1) {
                        txt = `You have bought ${format(tmp[upgrade.layer].buyables[upgrade.id].effect)} Branch Points using Points.<br><br>`
                    }
                    if (upgrade.num === 2) {
                        txt = `You have bought ${format(tmp[upgrade.layer].buyables[upgrade.id].effect)} Branch Points using Prestige Points.<br><br>`
                    }
                    if (upgrade.num === 3) {
                        txt = `You have bought ${format(tmp[upgrade.layer].buyables[upgrade.id].effect)} Branch Points using Tree Points.<br><br>`
                    }
                } else if (upgrade.type === 3) {
                    txt = `Amount: ${format(player[upgrade.layer].dimensionAccu[upgrade.num - 1])} (${format(player[upgrade.layer].buyables[upgrade.id])}), Mult: &times;${format(upgrade.effect(player[upgrade.layer].buyables[upgrade.id]))}<br>`
                    if (upgrade.num === 9) {
                        txt = `Enhancer #${format(player[upgrade.layer].buyables[upgrade.id].add(1))}<br><br>`
                    }                     
                    if (upgrade.num === 10) {
                        txt = `Galaxy #${format(player[upgrade.layer].buyables[upgrade.id].add(1))}<br><br>`
                    }
                } else if (upgrade.type === 2) {
                    txt = `${[null, "Rank", "Tier", "Tetr"][upgrade.num]} ${format(player[upgrade.layer].buyables[upgrade.id])}<br>` 
                } else {
                    txt = `You have ${format(player[upgrade.layer].buyables[upgrade.id], 0)} ${["Point", "PP", null, null, null, "Hyper Scaling"][upgrade.type]} Buyable ${upgrade.num}.<br>`
                }
                if (upgrade.stupidHack()) {
                    txt += `Effect Base: `
                    txt += upgrade.dispEffBase()
                    txt += `<br>Base Cost Formula: ` 
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

                    let hasExtra = false
                    if (upgrade.type === 0 && upgrade.num === 4) {
                        if (!hasExtra) {
                            txt += `<br>`
                        }
                        txt += `<br>Scales exponentially after ${format(100)} purchases.`
                    }
                    if (upgrade.type === 1 && upgrade.num === 2) {
                        if (!hasExtra) {
                            txt += `<br>`
                        }
                        txt += `<br>Scales exponentially after ${format(1e4)} purchases.`
                    }
                    if (upgrade.type === 1 && upgrade.num === 3) {
                        if (!hasExtra) {
                            txt += `<br>`
                        }
                        txt += `<br>Scales exponentially after ${format(1e6)} purchases.`
                    }
                    if (upgrade.type === 3 && upgrade.num === 10) {
                        if (!hasExtra) {
                            txt += `<br>`
                        }
                        txt += `<br>Scales exponentially after ${format(10)} purchases.`
                    }
                } else {
                    txt += `Effect: `
                    txt += upgrade.dispEffect() 
                    txt += `<br>Cost: ${format(upgrade.cost())} `
                    if (upgrade.type === 0) {
                        txt += `Points`
                    }
                    if (upgrade.type === 1) {
                        if (inChallenge(upgrade.layer, 22) && !player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                            txt += `Points`
                        } else {
                            txt += `Essence`
                        }
                    }
                    if (upgrade.type === 2) {
                        txt += [null, "Points", "Ranks", "Tiers"][upgrade.num]
                    }
                    if (upgrade.type === 3) {
                        if (upgrade.num === 1) {
                            txt += `Prestige Points`
                        } else {
                            if (upgrade.num === 10) {
                                txt += `Prestige Dimension 8`
                            } else {
                                txt += `Prestige Energy`
                            }
                        }
                    }
                    if (upgrade.type === 4) {
                        if (upgrade.num === 1) {
                            txt += `Points`
                        }
                        if (upgrade.num === 2) {
                            txt += `Prestige Points`
                        }
                        if (upgrade.num === 3) {
                            txt += `Tree Points`
                        }
                    }
                    if (upgrade.type === 5) {
                        txt += `Hyper Scaling Points`
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
                    if (inChallenge(upgrade.layer, 22) && !player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                        resource = player.points;
                    } else {
                        resource = player[upgrade.layer].essence;
                    }
                }
                if (upgrade.type === 2) {
                    if (upgrade.num === 1) {
                        resource = player.points
                    } else {
                        resource = player[upgrade.layer].buyables[50 + upgrade.num - 1];
                    }
                }
                if (upgrade.type === 3) {
                    if (upgrade.num === 1) {
                        resource = player[upgrade.layer].points
                    } else {
                        if (upgrade.num === 10) {
                            resource = player[upgrade.layer].buyables[68]
                        } else {
                            resource = player[upgrade.layer].energy;
                        }
                    }
                }
                if (upgrade.type === 4) {
                    if (upgrade.num === 1) {
                        resource = player.points
                    }
                    if (upgrade.num === 2) {
                        resource = player[upgrade.layer].points
                    }
                    if (upgrade.num === 3) {
                        resource = player[upgrade.layer].treePoints
                    }
                }
                if (upgrade.type === 5) {
                    resource = player[upgrade.layer].hsPoints;
                }

                return resource.gte(upgrade.cost());
            }
            upgrade.buy = () => {
                if (upgrade.type === 0) {
                    player.points = player.points.sub(upgrade.cost());
                }
                if (upgrade.type === 1) {
                    if (inChallenge(upgrade.layer, 22) && !player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                        player.points = player.points.sub(upgrade.cost());
                    } else {
                        player[upgrade.layer].essence = player[upgrade.layer].essence.sub(upgrade.cost());
                    }
                }
                if (upgrade.type === 2) {
                    if (upgrade.num >= 3) {
                        setBuyableAmount(upgrade.layer, 52, D(0))
                    }
                    if (upgrade.num >= 2) {
                        setBuyableAmount(upgrade.layer, 51, D(0))
                        player[upgrade.layer].milestones = []
                    }
                    tmp.q.doReset(true)
                }
                if (upgrade.type === 3) {
                    if (upgrade.num === 1) {
                        player[upgrade.layer].points = player[upgrade.layer].points.sub(upgrade.cost());                        
                    } else {
                        if (upgrade.num === 9) {
                            for (let i = 0; i < 8; i++) {
                                player[upgrade.layer].dimensionAccu[i] = D(0)
                                setBuyableAmount(upgrade.layer, 61 + i, D(0))
                            }
                            player[upgrade.layer].energy = D(0)
                        } else {
                            if (upgrade.num === 10) {
                                for (let i = 0; i < 8; i++) {
                                    player[upgrade.layer].dimensionAccu[i] = D(0)
                                    setBuyableAmount(upgrade.layer, 61 + i, D(0))
                                }
                                
                                // const UNSAFE_UPGRADES = [51, 52, 53, 54, 55, 61, 62, 63, 64, 65]
                                // player[upgrade.layer].upgrades = player[upgrade.layer].upgrades.filter((upg) => { return !UNSAFE_UPGRADES.includes(upg) })
                                player[upgrade.layer].energy = D(0)
                            } else {
                                player[upgrade.layer].energy = player[upgrade.layer].energy.sub(upgrade.cost());
                            }
                        }
                    }
                }
                if (upgrade.type === 4) {
                    if (upgrade.num === 1) {
                        player.points = player.points.sub(upgrade.cost());
                    }
                    if (upgrade.num === 2) {
                        player[upgrade.layer].points = player[upgrade.layer].points.sub(upgrade.cost());
                    }
                    if (upgrade.num === 3) {
                        player[upgrade.layer].treePoints = player[upgrade.layer].treePoints.sub(upgrade.cost());
                    }
                }
                if (upgrade.type === 5) {
                    player[upgrade.layer].hsPoints = player[upgrade.layer].hsPoints.sub(upgrade.cost());
                }

                addBuyables(upgrade.layer, upgrade.id, 1);

                if (upgrade.type === 1) {
                    if (inChallenge(upgrade.layer, 22)) {
                        if (!player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                            player[upgrade.layer].challenge22Unlocks.push(upgrade.num)
                        }
                    }
                }
            };
            upgrade.buyMax = () => {
                if (upgrade.type === 1) {
                    if (inChallenge(upgrade.layer, 22)) {
                        if (!player[upgrade.layer].challenge22Unlocks.includes(upgrade.num)) {
                            return
                        }
                    }
                }

                setBuyableAmount(upgrade.layer, upgrade.id, upgrade.target().add(1).floor().max(player[upgrade.layer].buyables[upgrade.id]))
            }
        }
        return upgrades;
    })(),
    clickables: {
        11: {
            title: "Q. Reset for Tree Points",
            display() {
                return `You will gain ${format(tmp.p.tpGain)} Tree Points on reset.<br>Next at ${format(tmp.p.tpNext)} Prestige Points.`
            },
            canClick() {
                return player.p.points.gte('e360')
            },
            onClick() {
                player.p.treePoints = Decimal.add(player.p.treePoints, tmp.p.tpGain)
                tmp.q.doReset(true)
            }
        },
        21: {
            title: "Respec Tree Upgrades",
            display() {
                return `Do a prestige reset for no reward, and reset your upgrades.`
            },
            canClick() {
                return true
            },
            onClick() {
                const SAFE_UPGRADES = [11, 12, 13, 14, 15, 21, 22, 23, 24, 31, 41, 42, 43, 44, 45, 51, 52, 53, 401, 402, 403, 404, 405, 411, 412, 413, 414, 415]

                player.p.upgrades = player.p.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
                player.p.totalBPUsed = D(0)
                tmp.q.doReset(true)
            }
        },
        31: {
            title: "Strengthen Buyable 5",
            unlocked() {
                return hasUpgrade('p', 212)
            },
            display() {
                return `${player.p.buyable5ClickCooldown.gt(0) ? 'You are on a cooldown for ' + format(player.p.buyable5ClickCooldown, 1) + 's!' : '' }<br>You have clicked ${format(player.p.buyable5Clicks)} times.<br><br>Every click gives ${format(tmp.p.b5ClickMult, 1)} clicks.`
            },
            canClick() {
                return player.p.buyable5ClickCooldown.lte(0)
            },
            onClick() {
                player.p.buyable5Clicks = Decimal.add(player.p.buyable5Clicks, tmp.p.b5ClickMult)
                player.p.buyable5ClickCooldown = hasUpgrade('p', 233) && !inChallenge('p', 23)
                    ? D(0.5)
                    : D(0)
            }
        },
        41: {
            title: "Recover Buyables",
            unlocked() {
                return inChallenge('p', 21)
            },
            display() {
                return `You have clicked ${format(player.p.challenge21Clicks)} times, making prestige buyables function at ${format(tmp.p.challenge21Effect.mul(100), 1)}% efficiency.<br><br>You have ${format(player.p.challenge21ClicksRemain, 1)} clicks remaining.`
            },
            canClick() {
                return player.p.challenge21ClicksRemain.gt(0)
            },
            onClick() {
                player.p.challenge21Clicks = Decimal.add(player.p.challenge21Clicks, 1)
                player.p.challenge21ClicksRemain = Decimal.sub(player.p.challenge21ClicksRemain, 1)
            }
        },
    },
    challenges: {
        11: {
            unlocked() {
                let i = false
                if (player.p.total.gte(1)) { i = true }
                return i
            },
            name: "Strengthened Dilation",
            challengeDescription: "Point dilation is stronger.",
            goalDescription: `Get ${format(1e9)} Points.`,
            canComplete() { return player.points.gte(1e9) },
            rewardDescription: `Unlock Point Buyable 3 and point scaling beyond ${format(1e10)} is weaker.`,
            onEnter() {
                player.points = D(0)
                setBuyableAmount('p', "11", D(0))
                setBuyableAmount('p', "12", D(0))
                setBuyableAmount('p', "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount('p', "14", D(0)) }
            },
            getDepths() {
                let i = inChallenge('p', 11, true) ? D(1) : D(0)

                if (inChallenge('p', 14)) {
                    i = i.add(tmp.p.challenges[14].getDepths.mul(2))
                }
                if (inChallenge('p', 41)) {
                    i = i.add(tmp.p.challenges[41].getDepths)
                }
                return i
            }
        },
        12: {
            unlocked() {
                let i = false
                if (player.p.total.gte(10)) { i = true }
                return i
            },
            name() { return `No PB2 (${format(challengeCompletions('p', 12), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription() {
                switch (challengeCompletions('p', 12).toNumber()) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return `Point Buyable 2 is disabled.`
                    case 5:
                    case 6:
                        return `Point Buyable 2 is disabled and Point Buyable 1 scales faster.`
                    case 7:
                    case 8:
                        return `Point Buyable 2 is disabled, Point Buyable 1 scales faster, and point gain is reduced.`
                    case 9:
                        return `Point Buyable 2 is disabled, Point Buyable 1 scales faster, point gain is reduced, and Point Buyable 1's base is weakened.`
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                        if (hasUpgrade('l', 26)) {
                            return `Point Buyable 2-5 is disabled. Point Buyable 1 scales faster and is weaker. Point gain is reduced. Prestige Buyable 6 and 9 are disabled.`
                        }
                        return `Maxed out lol`
                    case 14:
                    case 15:
                    case 16:
                    case 17:
                    case 18:
                        return `Point Buyable 2-5 is disabled. Point Buyable 1 scales faster and is weaker. Only Point Buyable 1 influences point gain, and it is reduced. Prestige Buyable 6 and 9 are disabled.`
                    case 19:
                        return `Point Buyable 2-5 is disabled. Point Buyable 1 scales faster and is severely weakened. Only Point Buyable 1 influences point gain, and it is reduced. Prestige Buyable 6 and 9 are disabled.`
                    case 20:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 12 description sucks lmao ${challengeCompletions('p', 12).toNumber()} out of bounds?`)
                }
            },
            rewardDescription() {
                switch (challengeCompletions('p', 12).toNumber()) {
                    case 0:
                        return `PB2's base is increased by +${format(0.025, 3)}`
                    case 1:
                        return `PB2's base is increased by +${format(0.03, 3)}, and make Point Buyable 3 ${format(20, 3)}% more effective`
                    case 2:
                        return `PB2's base is increased by +${format(0.035, 3)}, and raise Point Buyable 2's effect to the ^${format(1.1, 3)}`
                    case 3:
                        return `PB2's base is increased by +${format(0.04, 3)}, and Point Buyable 3's multiplier &times;${format(1.02, 3)} -> &times;${format(1.03, 3)}`
                    case 4:
                        return `PB2's base is increased by +${format(0.045, 3)}, and Point Buyable 1 is ${format(15, 3)}% more effective`
                    case 5:
                        return `PB2's base is increased by +${format(0.05, 3)} and scales ${formatPerc(1/(1-0.025), 2)} slower`
                    case 6:
                        return `PB2's base is increased by +${format(0.055, 3)} and scales ${formatPerc(1/(1-0.035), 2)} slower`
                    case 7:
                        return `PB2's base is increased by +${format(0.06, 3)}, scales ${formatPerc(1/(1-0.05), 2)} slower, and PB1's effect is dilated by ^${format(1.005, 3)}`
                    case 8:
                        return `PB2's base is increased by +${format(0.065, 3)}, scales ${formatPerc(1/(1-0.75), 2)} slower, and PB1's effect is dilated by ^${format(1.005, 3)}`
                    case 9:
                        return `PB2's base is increased by +${format(0.07, 3)}, scales ${formatPerc(1/(1-0.1), 2)} slower, and PB1's effect is dilated by ^${format(1.005, 3)}`
                    case 10:
                        if (hasUpgrade('l', 26)) {
                            return `PB2 is boosted by ^${format(2, 1)}. Super Scaling Points increase Hyper Scaling Point gain. (^${format(player.p.ssPoints.max('e100').log10().log10().log2().sub(1).div(50).add(1), 3)}) Unlock Luck Buyables.`
                        }
                        return `Maxed out lol`
                    case 11:
                        return `PB2 is boosted by ^${format(2.5, 1)}. Rank scaling is reduced by 5%.`
                    case 12:
                        return `PB2 is boosted by ^${format(3, 1)}. Tier scaling is reduced by 5%.`
                    case 13:
                        return `PB2 is boosted by ^${format(3.5, 1)}. Hyper Scaling Buyables scale 5% slower. Unlock more Luck features.`
                    case 14:
                        return `PB2 is boosted by ^${format(4, 1)}. Hyper Scaling's challenge effect scales better.`
                    case 15:
                        return `PB2 is boosted by ^${format(4.5, 1)}. Luck is raised by ^${format(1.04, 2)}. Luck Energy gain and effect to prestige dimensions are increased by ^${format(1.1, 2)}.`
                    case 16:
                        return `PB2 is boosted by ^${format(5, 1)}. Luck is raised by ^${format(1.04, 2)}. Prestige Dimension cost scaling is 5% slower.`
                    case 17:
                        return `PB2 is boosted by ^${format(5.5, 1)}. Luck is raised by ^${format(1.04, 2)}. Point's 1st and 2nd softcap are removed. Unlock 2 new pets.`
                    case 18:
                        return `PB2 is boosted by ^${format(6, 1)}. Luck is raised by ^${format(1.04, 2)}. Prestige Buyable 7 and 8 are vastly improved.`
                    case 19:
                        return `PB2 is boosted by ^${format(6.5, 1)}. Luck is raised by ^${format(1.1, 2)}. Prestige Buyable 9's effect is raised to the ^${format(1.01, 2)}. Unlock more Quaternion features.`
                    case 20:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 12 reward desc sucks lmao ${challengeCompletions('p', 12).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 9
                if (hasUpgrade('l', 26)) {
                    lim = 19
                }
                return [
                    D(1e6), D(1e8), D(1e10), D(1e12), D(1e14), D(1e14), D(1e16), D(1e13), D(1e18), D(1e18),
                    D('ee12'), D('ee14'), D('e4e14'), D('e2e15'), D('ee18'), D('ee22'), D('ee24'), D('e5e25'), D('ee27'), D('ee14')
                ][challengeCompletions('p', 12).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp.p.challenges[12].goal)} Points.`
            },
            canComplete() { return player.points.gte(tmp.p.challenges[12].goal) },
            onEnter() {
                player.points = D(0)
                setBuyableAmount('p', "11", D(0))
                setBuyableAmount('p', "12", D(0))
                setBuyableAmount('p', "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount('p', "14", D(0)) }
            },
            getDepths() {
                let i = inChallenge('p', 12, true) ? D(1) : D(0)
                return i
            },
            completionLimit() {
                if (hasUpgrade('l', 26)) {
                    return D(20)
                }
                return D(10)
            }
        },
        14: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 11)) { i = true }
                return i
            },
            name() { return `Crippled Points (${format(challengeCompletions('p', 14), 0)})`},
            challengeDescription: 'Point\'s scaling starts earlier, and Strengthened Dilation is applied twice.',
            rewardEffect() {
                let i = challengeCompletions('p', 14)
                i = Decimal.pow(25, i.pow(1.2))
                return i
            },
            rewardDisplay() { return `Point scaling at ${format(1e10)} is delayed to ${format(this.rewardEffect().mul(1e10))} (Doesn't work in prestige challenges)` },
            goal() {
                let i = challengeCompletions('p', 14)
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
                setBuyableAmount('p', "11", D(0))
                setBuyableAmount('p', "12", D(0))
                setBuyableAmount('p', "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount('p', "14", D(0)) }
            },
            onComplete() {
                if (hasMilestone('q', 10)) {
                    player.p.challenges[14] = Decimal.max(player.p.challenges[14], tmp.p.challenges[14].target.ceil())
                }
            },
            getDepths() {
                let i = inChallenge('p', 14, true) ? D(1) : D(0)

                if (inChallenge('q', 13)) {
                    i = i.add(tmp.q.challenges[13].getDepths)
                }
                return i
            },
            completionLimit() {
                return D(Infinity)
            },
            countsAs: [11]
        },
        21: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 242)) { i = true }
                if (inChallenge('p', 21) || challengeCompletions('p', 21).gt(0)) { i = true }
                return i
            },
            name() { return `Limited PP Buyables (${format(challengeCompletions('p', 21), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription: "Prestige Point autogeneration is disabled. PP Buyables are disabled, but a clickable can weakly re-enable them, resetting on prestige. You only have 200 clicks in this challenge total.",
            rewardDescription() {
                switch (challengeCompletions('p', 21).toNumber()) {
                    case 0:
                        return inChallenge('q', 13) ? `All PP Buyables are +5% more effective.` : `All PP Buyables are +0.1% more effective.`
                    case 1:
                        return inChallenge('q', 13) ? `All PP Buyables are +5% more effective. (Next total: +10%)` : `All PP Buyables are +0.1% more effective. (Next total: +0.2%)`
                    case 2:
                        return inChallenge('q', 13) ? `All PP Buyables are +5% more effective. (Next total: +15%)` : `All PP Buyables are +0.1% more effective. (Next total: +0.3%)`
                    case 3:
                        return inChallenge('q', 13) ? `All PP Buyables are +5% more effective. (Next total: +20%)` : `All PP Buyables are +0.1% more effective. (Next total: +0.4%)`
                    case 4:
                        return inChallenge('q', 13) ? `All PP Buyables are +5% more effective. (Next total: +25%)` : `All PP Buyables are +0.1% more effective. (Next total: +0.5%)`
                    case 5:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 21 reward desc sucks lmao ${challengeCompletions('p', 21).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 4
                return [D('e365'), D('e415'), D('e465'), D('e515'), D('e565')][challengeCompletions('p', 21).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp.p.challenges[21].goal)} Prestige Points.`
            },
            canComplete() { return player.p.points.gte(tmp.p.challenges[21].goal) },
            onEnter() {
                player.p.challenge21ClicksRemain = D(200)
                tmp.q.doReset(true, true, false)
            },
            ignoreHigherLayers: true,
            getDepths() {
                let i = inChallenge('p', 21, true) ? D(1) : D(0)

                if (inChallenge('p', 25)) {
                    i = i.add(tmp.p.challenges[25].getDepths)
                }

                return i
            },
            completionLimit() {
                return D(5)
            }
        },
        22: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 271)) { i = true }
                if (inChallenge('p', 22) || challengeCompletions('p', 22).gt(0)) { i = true }
                return i
            },
            name() { return `Pick Your Poison (${format(challengeCompletions('p', 22), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription: "Prestige Essence Buyables are disabled. You must pay an upfront point cost in order to reenable prestige essence buyables.",
            rewardDescription() {
                switch (challengeCompletions('p', 22).toNumber()) {
                    case 0:
                        return inChallenge('q', 13) ? `Prestige Buyables #1-2 are boosted by +10%.` : `Prestige Buyables #1-2 are boosted by +0.2%.`
                    case 1:
                        return inChallenge('q', 13) ? `Prestige Buyables #3-4 are boosted by +10%.` : `Prestige Buyables #3-4 are boosted by +0.2%.`
                    case 2:
                        return inChallenge('q', 13) ? `Prestige Buyables #5-6 are boosted by +10%.` : `Prestige Buyables #5-6 are boosted by +0.2%.`
                    case 3:
                        return inChallenge('q', 13) ? `Prestige Buyables #7-8 are boosted by +10%.` : `Prestige Buyables #7-8 are boosted by +0.2%.`
                    case 4:
                        return inChallenge('q', 13) ? `Prestige Buyables #9 are boosted by +10%.` : `Prestige Buyables #9 are boosted by +0.2%.`
                    case 5:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 22 reward desc sucks lmao ${challengeCompletions('p', 22).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 4
                return [D('e390'), D('e450'), D('e510'), D('e570'), D('e630')][challengeCompletions('p', 22).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp.p.challenges[22].goal)} Prestige Points.`
            },
            canComplete() { return player.p.points.gte(tmp.p.challenges[22].goal) },
            onEnter() {
                player.p.challenge22Unlocks = []
                tmp.q.doReset(true, true, false)
            },
            ignoreHigherLayers: true,
            getDepths() {
                let i = inChallenge('p', 22, true) ? D(1) : D(0)

                if (inChallenge('p', 25)) {
                    i = i.add(tmp.p.challenges[25].getDepths)
                }

                return i
            },
            completionLimit() {
                return D(5)
            }
        },
        23: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 275)) { i = true }
                if (inChallenge('p', 23) || challengeCompletions('p', 23).gt(0)) { i = true }
                return i
            },
            name() { return `Race to the Finish (${format(challengeCompletions('p', 23), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription: "Points are stuck at your PPS. Prestige Points cannot be auto-generated. Point Buyable 5's effect is reduced and decays over time with clicks. Reach 0 points and you will be kicked out.",
            rewardDescription() {
                switch (challengeCompletions('p', 23).toNumber()) {
                    case 0:
                        return `Point Buyable 5's timer & click multipliers are increased by 1.5&times;.`
                    case 1:
                        return `Point Buyable 5's timer & click multipliers are increased by 2&times;. (Next total: 3&times;)` // total: 3x
                    case 2:
                        return `Point Buyable 5's timer & click multipliers are increased by 3&times;. (Next total: 9&times;)` // total: 9x
                    case 3:
                        return `Point Buyable 5's timer & click multipliers are increased by 5&times;. (Next total: 45&times;)` // total: 45x
                    case 4:
                        return `Point Buyable 5's timer & click multipliers are increased by 8&times;. (Next total: 360&times;)` // total: 360x
                    case 5:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 23 reward desc sucks lmao ${challengeCompletions('p', 23).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 4
                return [D('e475'), D('e550'), D('e625'), D('e700'), D('e775')][challengeCompletions('p', 23).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp.p.challenges[23].goal)} Prestige Points.`
            },
            canComplete() { return player.p.points.gte(tmp.p.challenges[23].goal) },
            onEnter() {
                tmp.q.doReset(true, true, false)
                player.p.buyable5Clicks = D(20)
            },
            ignoreHigherLayers: true,
            getDepths() {
                let i = inChallenge('p', 23, true) ? D(1) : D(0)

                if (inChallenge('p', 25)) {
                    i = i.add(tmp.p.challenges[25].getDepths)
                }

                return i
            },
            completionLimit() {
                return D(5)
            }
        },
        24: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 291)) { i = true }
                if (inChallenge('p', 24) || challengeCompletions('p', 24).gt(0)) { i = true }
                return i
            },
            name() { return `Death (${format(challengeCompletions('p', 24), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription: "Buyable 4 and Prestige Buyable 4 are disabled.",
            rewardDescription() {
                switch (challengeCompletions('p', 24).toNumber()) {
                    case 0:
                        return `Point Buyable 4 adds 25 free levels to Prestige Buyable 4.`
                    case 1:
                        return `Point Buyable 4 adds 50 free levels to Prestige Buyable 4. (Next total: +75)`
                    case 2:
                        return `Point Buyable 4 adds 75 free levels to Prestige Buyable 4. (Next total: +150)`
                    case 3:
                        return `Point Buyable 4 adds 100 free levels to Prestige Buyable 4. (Next total: +250)`
                    case 4:
                        return `Point Buyable 4 adds 150 free levels to Prestige Buyable 4. (Next total: +400)`
                    case 5:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 24 reward desc sucks lmao ${challengeCompletions('p', 24).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 4
                return [D('e475'), D('e555'), D('e635'), D('e715'), D('e795')][challengeCompletions('p', 24).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp.p.challenges[24].goal)} Prestige Points.`
            },
            canComplete() { return player.p.points.gte(tmp.p.challenges[24].goal) },
            onEnter() {
                tmp.q.doReset(true, true, false)
            },
            ignoreHigherLayers: true,
            getDepths() {
                let i = inChallenge('p', 24, true) ? D(1) : D(0)

                if (inChallenge('p', 25)) {
                    i = i.add(tmp.p.challenges[25].getDepths)
                }

                return i
            },
            completionLimit() {
                return D(5)
            }
        },
        25: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 311)) { i = true }
                if (inChallenge('p', 25) || challengeCompletions('p', 25).gt(0)) { i = true }
                return i
            },
            name() { return `Finality (${format(challengeCompletions('p', 25), 0)}/${format(this.completionLimit(), 0)})`},
            challengeDescription: "Branch Challenges 1-4 are applied. Point Buyable 5's click decay is 3&times; slower.",
            rewardDescription() {
                switch (challengeCompletions('p', 25).toNumber()) {
                    case 0:
                        return `Point, Prestige, Quaternion, and HSP gain is increased by ^1.02.`
                    case 1:
                        return `Point, Prestige, Quaternion, and HSP gain is increased by ^1.02. (Next total: ^1.04)`
                    case 2:
                        return `Point, Prestige, Quaternion, and HSP gain is increased by ^1.02. (Next total: ^1.06)`
                    case 3:
                        return `Point, Prestige, Quaternion, and HSP gain is increased by ^1.02. (Next total: ^1.08)`
                    case 4:
                        return `Point, Prestige, Quaternion, and HSP gain is increased by ^1.02. (Next total: ^1.10)`
                    case 5:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 25 reward desc sucks lmao ${challengeCompletions('p', 25).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 4
                return [D('e600'), D('e750'), D('e900'), D('e1050'), D('e1200')][challengeCompletions('p', 25).min(lim).toNumber()]
            },
            goalDescription() {
                return `Get ${format(tmp.p.challenges[25].goal)} Prestige Points.`
            },
            canComplete() { return player.p.points.gte(tmp.p.challenges[25].goal) },
            onEnter() {
                tmp.q.doReset(true, true, false)
                player.p.buyable5Clicks = D(20)
                player.p.challenge22Unlocks = []
                player.p.challenge21ClicksRemain = D(200)
            },
            ignoreHigherLayers: true,
            getDepths() {
                let i = inChallenge('p', 25, true) ? D(1) : D(0)
                return i
            },
            completionLimit() {
                return D(5)
            }
        },
        31: {
            unlocked() {
                let i = false
                if (player.p.total.gte(100)) { i = true }
                return i
            },
            name: "Super Scaling",
            challengeDescription: 'All Point Buyables scale harsher, and PP\'s effect is nullified',
            rewardEffect() {
                let i = player.p.ssChalBest
                i = i.max(1e5).log(1e5).sub(1).div(10).add(1).ln().div(2).add(1)
                return i
            },
            rewardDisplay() { return `Point Buyable 2\'s effect is raised to the ^${format(this.rewardEffect(), 4)}` },
            goal() {
                return D(Infinity)
            },
            goalDescription() {
                return `Get higher than ${format(player.p.ssChalBest)} Points.`
            },
            canComplete() { return false },
            onEnter() {
                player.points = D(0)
                setBuyableAmount('p', "11", D(0))
                setBuyableAmount('p', "12", D(0))
                setBuyableAmount('p', "13", D(0))
                if (!hasUpgrade('p', 13)) { setBuyableAmount('p', "14", D(0)) }
            },
            getDepths() {
                let i = inChallenge('p', 31, true) ? D(1) : D(0)

                if (inChallenge('p', 41)) {
                    i = i.add(tmp.p.challenges[41].getDepths)
                }
                if (inChallenge('q', 13)) {
                    i = i.add(tmp.q.challenges[13].getDepths)
                }
                if (hasUpgrade('p', 282)) {
                    i = i.mul(0.95)
                }
                return i
            },
            completionLimit() {
                return D(1)
            }
        },
        41: {
            unlocked() {
                let i = false
                if (hasUpgrade('p', 301)) { i = true }
                if (player.p.hsChalBest.gt(0)) { i = true }
                return i
            },
            name: "Hyper Scaling",
            challengeDescription: 'Strengthed Dilation and Super Scaling are applied. Point Buyable 3\'s effectiveness is raised ^0.5. This challenge does a Q. Reset.',
            rewardEffect() {
                let i = player.p.hsChalBest
                i = inChallenge('q', 14)
                    ? i.max('e3000').log('e3000').pow(3)
                    : i.max('e3e5').log('e3e5')

                if (i.gte(10)) {
                    if (challengeCompletions('p', 12).gte(15)) {
                        i = i.div(10).ln().add(1).mul(10)
                    } else {
                        i = i.log10().mul(10)
                    }
                }
                return i
            },
            rewardDisplay() { return `Non-free Point Buyable 1 is &times;${format(this.rewardEffect(), 2)} more effective.` },
            goal() {
                return D(Infinity)
            },
            goalDescription() {
                return `Get higher than ${format(player.p.hsChalBest)} Points.`
            },
            canComplete() { return false },
            onEnter() {
                tmp.q.doReset(true, true, false)
            },
            ignoreHigherLayers: true,
            getDepths() {
                let i = inChallenge('p', 41, true) ? D(1) : D(0)
                return i
            },
            completionLimit() {
                return D(1)
            }
        },
    },
    upgrades: {
        11: {
            title: "Four of Each",
            description: "Unlock Point Buyable and Challenge 4.",
            cost: new Decimal(100000),
            unlocked: true,
        },
        12: {
            title: "Delay. Delay?",
            description: "Prestige Essence delays Point Buyable 3 cost.",
            cost: new Decimal(1e7),
            unlocked() { return hasUpgrade('p', 11) },
            effect() { 
                let ret = player.p.essence.max(10).log10().log10().add(1).pow(2).sub(1)
                return ret;
            },
            effectDisplay() { return `-${format(this.effect(), 3)} purchases` }, 
        },
        13: {
            title: "Designations",
            description: "Keep Point Buyable 4 on PP reset, and unlock a new prestige layer.",
            cost: new Decimal(1e8),
            unlocked() { return hasUpgrade('p', 12) },
        },
        14: {
            title: "PE -> PB1",
            description: "Point Buyable 1's base is increased based off of Prestige Essence.",
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade('p', 13) },
            effect() { 
                let ret = player.p.essence.max(1).log10()
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}` }, 
        },
        15: {
            title: "PBx -> PBx",
            description: "PP Buyables 4-6 add 0.4 free levels to Point Buyables 1-3 respectively.",
            cost: new Decimal('e450'),
            unlocked() { return challengeCompletions('q', 11).gte(1) },
        },
        21: {
            title: "AutoUnlock I",
            description: "Unlock the Point Buyable 1 Autobuyer.",
            cost: new Decimal(10000),
            unlocked: true,
        },
        22: {
            title: "AutoUnlock II",
            description: "Unlock the Point Buyable 2 Autobuyer.",
            cost: new Decimal(250000),
            unlocked() { return hasUpgrade('p', 21) },
        },
        23: {
            title: "AutoUnlock III",
            description: "Unlock the Point Buyable 3 Autobuyer.",
            cost: new Decimal(2e6),
            unlocked() { return hasUpgrade('p', 22) },
        },
        24: {
            title: "AutoUnlock IV",
            description: "Unlock the Point Buyable 4 Autobuyer.",
            cost: new Decimal('e800'),
            unlocked() { return challengeCompletions('q', 11).gte(1) },
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
            unlocked() { return hasUpgrade('p', 31) },
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
            unlocked() { return hasUpgrade('p', 31) },
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
            description: "All Point Buyables scale slower based off of your total prestige points.",
            cost: new Decimal(1e15),
            unlocked() { return hasUpgrade('p', 31) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.total.max(1e6).log(1e6).ln().add(1).ln().div(10).add(1)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 2)}` }, 
        },
        44: {
            title: "Point Pusher",
            description: "The second point softcap at 1.000 Dc is delayed based off of your Super Scaling Points.",
            cost: new Decimal(1e21),
            unlocked() { return hasUpgrade('p', 31) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.ssPoints.max(1e21).div(1e21).pow(0.25)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` }, 
        },
        45: {
            title: "Prestige Dampener",
            description: "All PP Buyables scale slower based off of your Super Scaling points.",
            cost: new Decimal('e10000'),
            unlocked() { return challengeCompletions('q', 11).gte(1) },
            currencyInternalName: 'ssPoints',
            currencyDisplayName: 'Super Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                return player.p.ssPoints.max(1e10).log10().log10().log(4).mul(0.01).add(1)
            },
            effectDisplay() { return `-${formatPerc(this.effect())}` }, 
        },
        51: {
            title: "Enhancer^2",
            description: "Enhancers increase the multiplier per dimension bought.",
            cost: new Decimal(1e80),
            unlocked() { return inChallenge('q', 12) || challengeCompletions('q', 13).gte(1) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
            effect() { 
                return player.p.buyables[69].mul(0.05)
            },
            effectDisplay() { return `+${format(this.effect(), 2)}` }, 
        },
        52: {
            title: "Self-Effect",
            description: "Enhancers also add free levels to Prestige Essence Buyable 9.",
            cost: new Decimal(1e100),
            unlocked() { return inChallenge('q', 12) || challengeCompletions('q', 13).gte(1) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
        },
        53: {
            title: "Wrap-Around",
            description: "Prestige Dimension 1 produces Prestige Dimension 8 at a reduced rate.",
            cost: new Decimal(1e120),
            unlocked() { return inChallenge('q', 12) || challengeCompletions('q', 13).gte(1) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
            effect() {
                let i = D(0.1)
                if (hasUpgrade('p', 62)) {
                    i = i.add(0.05)
                }
                return i
            },
            effectDisplay() { return `^${format(this.effect(), 2)}` }, 
        },
        54: {
            title: "Why is it super-exponential?",
            description: "Prestige Dimension 1's *quadratic* cost scaling is removed.",
            cost: new Decimal('e400'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            }
        },
        55: {
            title: "Enhancers kinda need a boost",
            description: "Prestige Enhancers' linear cost scaling is reduced to 1.15, and every Enhancer increases its' effect base to mult by +0.5.",
            cost: new Decimal('e850'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
            effect() { 
                return (player.p.buyables[69] ?? D(0)).mul(0.5)
            },
            effectDisplay() { return `+${format(this.effect(), 1)}` }, 
        },
        61: {
            title: "Enhancers kinda need a boost",
            description: "Every Tier increases multiplier per bought by &times;1.02.",
            cost: new Decimal('e1500'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
            effect() { 
                return (player.p.buyables[52] ?? D(0)).pow_base(1.02)
            },
            effectDisplay() { return `&times;${format(this.effect(), 2)}` }, 
        },
        62: {
            title: "11 studs.",
            description: "Wrap-Around's exponent is increased by +0.05.",
            cost: new Decimal('e2500'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
        },
        63: {
            title: "Prestige Hecker",
            description: "Enhancer's effect to free levels are improved past Enhancer #20.",
            cost: new Decimal('e4000'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
        },
        64: {
            title: "Scaling to the Max",
            description: "Hyper Scaling intervals also affect Prestige Dimensions.",
            cost: new Decimal('e7500'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
        },
        65: {
            title: "Pain",
            description: "Unlock Prestige Galaxies.",
            cost: new Decimal('e15000'),
            unlocked() { return hasUpgrade('l', 21) },
            currencyInternalName: 'energy',
            currencyDisplayName: 'Prestige Energy',
            currencyLocation() {
                return player.p
            },
        },
        201: {
            title: "(u1) The 5th one doesn't exist",
            description: "Unlock Point Buyable 5, which raises points over time. This resets on prestige+ resets.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [211, 212],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        211: {
            title: "(u2-1) General Boost",
            description() {
                return `Needs u1<br>${hasUpgrade('p', 414) ? '' : '<b>Disables u2-2</b>'}<br><br>Point Buyable 5 is boosted by ${hasUpgrade('p', 212) && hasUpgrade('p', 414) ? 1 : 1.3}x.`
            },
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 201)
                    && (!hasUpgrade('p', 212) || hasUpgrade('p', 414))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [222],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        212: {
            title: "(u2-2) Average Clicker Game",
            description() {
                return `Needs u1<br>${hasUpgrade('p', 414) ? '' : '<b>Disables u2-1</b>'}<br><br>Point Buyable 5 is boosted by ${hasUpgrade('p', 211) && hasUpgrade('p', 414) ? 1 : 1.2}x, but time is replaced with clicks. (A clickable will spawn under PB5.)`
            },
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 201)
                    && (!hasUpgrade('p', 211) || hasUpgrade('p', 414))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [223],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        221: {
            title: "(u3-1-2) Prestige <-> Points",
            description: "Needs u3-1-1<br><br>Multiply points based off prestige points.<br>",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 222)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = Decimal.max(player.p.points, 1).pow(10)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` },
            branches: [231],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        222: {
            title: "(u3-1-1) Super Buyable 5",
            description: "Needs u2-1<br><br>Buyable 5 also boosts Super Scaling Points.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 211)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [221, 232],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        223: {
            title: "(u3-2-1) Bulk Clicking",
            description: "Needs u2-2<br><br>Total Branch Points increases Buyable 5's click count and keep 80% of clicks on prestige reset.<br>",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 212)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = tmp.p.totalBP
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` },
            branches: [224, 233],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        224: {
            title: "(u3-2-2) Super Scaling <-> Points",
            description: "Needs u3-2-1<br><br>Multiply points based off super scaling points.<br>",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 223)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = Decimal.max(player.p.ssPoints, 1).pow(2)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` },
            branches: [234],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        231: {
            title: "(u4-1-2) Rank Decay",
            description: "Needs u3-1-2<br><br>Reduce Rank requirement over time in Quaternion.<br>",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 221)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = player.q.timeInQ
                if (hasUpgrade('p', 241)) {
                    ret = ret.add(300).mul(20)
                }
                ret = inChallenge('q', 14)
                    ? ret.div(8).add(1).ln().mul(2).add(1).recip()
                    : ret.div(8).add(1).ln().mul(0.02).add(1).recip()
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 4)}` },
            branches: [241],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        232: {
            title: "(u4-1-1) Inter-Buyable Synergy",
            description: "Needs u3-1-1<br><br>Point Buyable 5 also boosts Point Buyable 2 at a reduced rate.<br>",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 222)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = tmp.p.buyables[15].effect.sub(1).div(2).add(1)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)}` },
            branches: [242],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        233: {
            title: "(u4-2-1) No more spam",
            description: "Needs u3-2-1<br><br>Point Buyable 5's clickable's click mult is increased by 25&times;, but it now has a cooldown of 0.5s per click.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 223)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [242],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        234: {
            title: "(u4-2-2) Tier Decay",
            description: "Needs u3-2-2<br><br>Reduce Tier requirement by 1 every time Buyable 5 bought doubles.<br>",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 224)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = Decimal.lt(player.p.buyables[15], 1) 
                    ? D(0)
                    : player.p.buyables[15].log2().add(1).floor()
                return ret;
            },
            effectDisplay() { return `-${format(this.effect())}, next at ${format(this.effect().pow_base(2))}` },
            branches: [243],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        241: {
            title: "(u5-1-2) Slow as hell",
            description: "Needs u4-1-2<br><br>u4-1-2's timer is sped up by 20&times; and is pushed forward by 5 minutes.",
            cost: new Decimal(10),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && (hasUpgrade('p', 231))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        242: {
            title: "(u5-c) How many challenges do we need?!",
            description: "Needs u4-1-1 or u4-2-1<br><br>Unlock Branch Challenge 1.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && (hasUpgrade('p', 232) || hasUpgrade('p', 233))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [251, 252, 253],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px"
            }
        },
        243: {
            title: "(u5-2-2) Expensive as hell",
            description: "Needs u4-2-2<br><br>Reduce Point Buyable 5's cost by ^0.9 every Branch Challenge completion.<br>",
            cost: new Decimal(10),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 234)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = challengeCompletions('p', 21).add(challengeCompletions('p', 22)).add(challengeCompletions('p', 23)).add(challengeCompletions('p', 24)).add(challengeCompletions('p', 25))
                ret = ret.pow_base(0.9)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 4)}` },
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        251: {
            title: "(u6-1) Point Boost",
            description() {
                return `Needs u5-c & BC1x1 completion<br>${!hasUpgrade('p', 421) ? '<b>Disables u6-2 and u6-3</b><br>' : ''}<br>Point Buyables are ${inChallenge('q', 14) ? 5 : 0.1}% more effective.`
            },
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 242) && challengeCompletions('p', 21).gte(1)
                    && (!(hasUpgrade('p', 252) || hasUpgrade('p', 253)) || hasUpgrade('p', 421))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [261],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px"
            }
        },
        252: {
            title: "(u6-2) prestige Boost",
            description() {
                return `Needs u5-c & BC1x1 completion<br>${!hasUpgrade('p', 421) ? '<b>Disables u6-1 and u6-3</b><br>' : ''}<br>Prestige Buyables are ${inChallenge('q', 14) ? 5 : 0.1}% more effective.`
            },
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 242) && challengeCompletions('p', 21).gte(1)
                    && (!(hasUpgrade('p', 251) || hasUpgrade('p', 253)) || hasUpgrade('p', 421))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [262],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        253: {
            title: "(u6-3) Prestige Boost",
            description() {
                return `Needs u5-c & BC1x1 completion<br>${!hasUpgrade('p', 421) ? '<b>Disables u6-1 and u6-2</b><br>' : ''}<br>Quaternion Buyables are 10% more effective.`
            },
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 242) && challengeCompletions('p', 21).gte(1)
                    && (!(hasUpgrade('p', 251) || hasUpgrade('p', 252)) || hasUpgrade('p', 421))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [263],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        261: {
            title: "(u7-1) Point Push-Through",
            description: "Needs u6-1<br><br>Point's 2nd softcap is 10% weaker.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 251)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [272],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        262: {
            title: "(u7-2) Prestige Boost Again",
            description: "Needs u6-2<br><br>Prestige Points are raised ^1.05.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 252)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [273],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        263: {
            title: "(u7-3) Quaternion Boost",
            description: "Needs u6-3<br><br>Quaternion Charge gain is raised ^1.2.",
            cost: new Decimal(1),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 253)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [274],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        271: {
            title: "(u8-1-c) Uneternity Challenges Again",
            description: "Needs u7-1<br><br>Unlock Branch Challenge 2.",
            cost: new Decimal(6),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 272)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        272: {
            title: "(u8-1) More free levels",
            description: "Needs u7-1<br><br>Add 2 free levels to Point Buyable 4.",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 261)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [271, 282],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        273: {
            title: "(u8-2) Extras for Crippled Points",
            description: "Needs u7-2<br><br>\"Crippled Points\" completions raise prestige point gain.<br>",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 262)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            effect() { 
                let ret = challengeCompletions('p', 14).max(1).log10().mul(0.01).add(1)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)}` },
            branches: [283],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        274: {
            title: "(u8-3) More free levels",
            description: "Needs u7-3<br><br>Quaternion gain and effect are raised ^1.1.",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 263)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [275, 284],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        275: {
            title: "(u8-3-c) Constant Clicking",
            description: "Needs u7-3 and u2-2<br><br>Unlock Branch Challenge 3",
            cost: new Decimal(6),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 274)
                    && hasUpgrade('p', 212)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        281: {
            title: "(u9-1-2) This side is interesting",
            description: "Needs u9-1-1 and u2-1<br><br>Point Buyable 5's timer goes by 2&times; faster.",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 282) && hasUpgrade('p', 211)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        282: {
            title: "(u9-1-1) Point Descaler",
            description: "Needs u8-1<br><br>Make the Super Scaling Challenge's effect 5% weaker.",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 272)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [291, 281],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        283: {
            title: "(u9-2) Am I allowed this?",
            description: "Needs u8-2<br><br>Prestige Buyable 8's effect to Prestige Point gain is raised ^25.",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 273)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [291],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        284: {
            title: "(u9-3) Quaternion Chaining",
            description: "Needs u8-3<br><br>Quaternion Buyables add free levels to the one prior to it.",
            cost: new Decimal(2),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 274)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [291],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
                "margin-right": "150px" // hardcoded to keep alignment because there's 4, not 3
            }
        },
        291: {
            title: "(u10-c) Death",
            description: "Needs u9-1-1, u9-2, or u9-3<br><br>Unlock Branch Challenge 4.",
            cost: new Decimal(4),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && (hasUpgrade('p', 282) || hasUpgrade('p', 283) || hasUpgrade('p', 284))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [301],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        301: {
            title: "(u11) Definitely not dilation",
            description: "Needs u10-c and BC4x2<br><br>Unlock Hyper Scaling Points and its challenge.",
            cost: new Decimal(20),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && (hasUpgrade('p', 291) && challengeCompletions('p', 24).gte(2))
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            branches: [311],
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        311: {
            title: "(u12) The Finale of the Tree",
            description: "Needs u11 and u2-2<br><br>Unlock Branch Challenge 5.",
            cost: new Decimal(24),
            unlocked() { return inChallenge('q', 13) || challengeCompletions('q', 14).gte(1) },
            currencyDisplayName: 'Branch Points',
            canAfford() {
                return tmp.p.totalBP.sub(player.p.totalBPUsed).gte(this.cost)
                    && hasUpgrade('p', 301)
                    && hasUpgrade('p', 212)
            },
            pay() {
                player.p.totalBPUsed = Decimal.add(player.p.totalBPUsed, this.cost)
            },
            style: {
                "min-width": "135px",
                "min-height": "135px",
                "margin": "5px",
            }
        },
        401: {
            title: "This again",
            description: "HSP gives a multiplier to prestige point gain.",
            cost: new Decimal(1000),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.hsPoints.max(0).add(1).pow(5)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` }, 
        },
        402: {
            title: "Just like the old times",
            description: "Total HSP gives a multiplier to point gain.",
            cost: new Decimal(10000),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.hsTotal.max(0).add(1).pow(5000)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` }, 
        },
        403: {
            title: "Tree Points Mattering?!",
            description: "Tree Points boost HSP gain.",
            cost: new Decimal(100000),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = inChallenge('q', 13)
                    ? player.p.treePoints.max(1e10).log10().div(10).pow(6)
                    : player.p.treePoints.max('e4000').log10().log(4000).sub(1).mul(10).add(1).pow(4)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 2)}` }, 
        },
        404: {
            title: "Branch to Hyper",
            description: "Total Branch Points give a multiplier to HSP gain.",
            cost: new Decimal(1e6),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = inChallenge('q', 13)
                    ? tmp.p.totalBP.div(35).max(1).pow(4.5)
                    : tmp.p.totalBP.max(1).log10().add(1).pow(1.5)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 2)}` }, 
        },
        405: {
            title: "Chaining Scaling",
            description: "HSP raises Super Scaling Point gain.",
            cost: new Decimal(1e10),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.hsPoints.max(1e5).log10().mul(2).log10()
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)}` }, 
        },
        411: {
            title: "Diverse Scaling",
            description: "HSP intervals also decrease Rank scaling. Capped at -95%",
            cost: new Decimal(1e16),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.hsBestGalaxies.pow_base(0.9995).recip()
                ret = ret.min(20)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 3)}` }, 
        },
        412: {
            title: "Self-Sustaining Scaling",
            description: "Generate free Branch points based on HSP.",
            cost: new Decimal(1e24),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.hsPoints.max(1e12).log10().div(12).pow(5).sub(1).div(310)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}/s` }, 
        },
        413: {
            title: "Diverse^2 Scaling",
            description: "HSP intervals also decrease Prestige Buyable scaling.",
            cost: new Decimal(1e30),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() { 
                let ret = player.p.hsBestGalaxies.pow_base(inChallenge('q', 13) ? 0.9995: 0.99995).recip()
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 3)}` }, 
        },
        414: {
            title: "We just need one more of this",
            description: "u2-1 and u2-2 no longer disable each other. These upgrades are slightly nerfed if both are bought.",
            cost: new Decimal(1e40),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            }
        },
        415: {
            title: "Over time...",
            description: "HSP gain is increased over time in Q.",
            cost: new Decimal(1e50),
            unlocked() { return hasUpgrade('p', 301) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
            effect() {
                // replace bestTimeInQ with a further layer
                let ret = hasUpgrade('p', 423) ? player.q.bestTimeInQ : player.q.timeInQ
                ret = ret.div(30).add(1).pow(12)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())}` }, 
        },
        421: {
            title: "And here's the second one!",
            description: "u6-1, u6-2, and u6-3 no longer disable each other.",
            cost: new Decimal(1e75),
            unlocked() { return hasUpgrade('p', 301) && (inChallenge('q', 14) || challengeCompletions('q', 14).gte(1)) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
        },
        422: {
            title: "Dimension Hopper",
            description: "All Prestige Dimensions are autobought.",
            cost: new Decimal(1e85),
            unlocked() { return hasUpgrade('p', 301) && (inChallenge('q', 14) || challengeCompletions('q', 14).gte(1)) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
        },
        423: {
            title: "Why does that have to reset?",
            description: "'Over time...' uses time in the next layer.",
            cost: new Decimal(1e95),
            unlocked() { return hasUpgrade('p', 301) && (inChallenge('q', 14) || challengeCompletions('q', 14).gte(1)) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
        },
        424: {
            title: "Rank Hopper",
            description: "Ranks are autobought and don't reset.",
            cost: new Decimal(1e120),
            unlocked() { return hasUpgrade('p', 301) && (inChallenge('q', 14) || challengeCompletions('q', 14).gte(1)) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
        },
        425: {
            title: "Branch Hopper",
            description: "Tree Points are generated with 100% the gain, and Branch Points are autobought. (Also, Tree Point gain uses a better formula.)",
            cost: new Decimal(1e150),
            unlocked() { return hasUpgrade('p', 301) && (inChallenge('q', 14) || challengeCompletions('q', 14).gte(1)) },
            currencyInternalName: 'hsPoints',
            currencyDisplayName: 'Hyper Scaling Points',
            currencyLocation() {
                return player.p
            },
        },
    }
})