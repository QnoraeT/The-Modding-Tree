"use strict";

const PET_FORMULAE = {
    xp_to_level(pet, xp) {
        if (xp.lt((PET_DATA[pet] ?? { baseXP: D(10) }).baseXP)) {
            return xp.div(
                (PET_DATA[pet] ?? { baseXP: D(10) }).baseXP
            ).add(1)
        }

        xp = xp.div(
            (PET_DATA[pet] ?? { baseXP: D(10) }).baseXP
        ).log(
            (PET_DATA[pet] ?? { baseSpd: D(2) }).baseSpd
        ).mul(
            (PET_DATA[pet] ?? { baseScale: D(1.01) }).baseScale.sub(1)
        ).add(1).log(
            (PET_DATA[pet] ?? { baseScale: D(1.01) }).baseScale
        )

        xp = xp.mul(tmp.r.challenges[15].rewardEffect.curr)
        if (hasUpgrade('q', 45)) {
            xp = xp.div(0.98)
        }

        xp = xp.add(2)

        return xp
    },
    level_to_xp(pet, lv) {
        if (lv.lt(2)) {
            return lv.sub(1).mul(
                (PET_DATA[pet] ?? { baseXP: D(10) }).baseXP
            )
        }

        lv = lv.sub(2)

        if (hasUpgrade('q', 45)) {
            lv = lv.mul(0.98)
        }
        lv = lv.div(tmp.r.challenges[15].rewardEffect.curr)

        lv = lv.pow_base(
            (PET_DATA[pet] ?? { baseScale: D(1.01) }).baseScale
        ).sub(1).div(
            (PET_DATA[pet] ?? { baseScale: D(1.01) }).baseScale.sub(1)
        ).pow_base(
            (PET_DATA[pet] ?? { baseSpd: D(2) }).baseSpd
        ).mul(
            (PET_DATA[pet] ?? { baseXP: D(10) }).baseXP
        )
        return lv
    }
}

const PET_DATA = {
    beam: {
        number: 1,
        name: "Beam",
        chance: D(16),
        colors: {
            fill: gRC(3.5, 0.9, 0.5),
            cannotEquip: gRC(3.5, 0.2, 0.2),
            base: gRC(3.5, 0.2, 0.5),
            text: gRC(3.5, 1.0, 0.1),
        },
        baseXP: D(1e16),
        baseSpd: D(1e4),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(1)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Add ${format(eff, 2)} free levels to the Line pet.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(0.01).add(1)
            return eff
        },
        activeEffsDesc(eff) {
            return `Raise luck by ^${format(eff, 2)}`
        }
    },
    sphere: {
        number: 2,
        name: "Sphere",
        chance: D(24),
        colors: {
            fill: gRC(2.0, 0.85, 0.5),
            cannotEquip: gRC(2.0, 0.2, 0.2),
            base: gRC(2.0, 0.2, 0.5),
            text: gRC(2.0, 1.0, 0.1),
        },
        baseXP: D(1e30),
        baseSpd: D(1e5),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(2)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Add ${format(eff, 2)} free levels to the Circle pet.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(0.01).add(1)
            return eff
        },
        activeEffsDesc(eff) {
            return `Raise Point Buyable 5 clicks by ^${format(eff, 2)}`
        }
    },
    pyramid: {
        number: 3,
        name: "Pyramid",
        chance: D(32),
        colors: {
            fill: gRC(1.0, 0.85, 0.5),
            cannotEquip: gRC(1.0, 0.2, 0.2),
            base: gRC(1.0, 0.2, 0.5),
            text: gRC(1.0, 1.0, 0.1),
        },
        baseXP: D(1e63),
        baseSpd: D(1e9),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(4)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Add ${format(eff, 2)} free levels to the Triangle pet.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(0.005).add(1)
            return eff
        },
        activeEffsDesc(eff) {
            return `HS Buyables' cost scalings are -${formatPerc(eff, 2)} slower.`
        }
    },
    cube: {
        number: 4,
        name: "Cube",
        chance: D(750),
        colors: {
            fill: gRC(5.8, 0.85, 0.5),
            cannotEquip: gRC(5.8, 0.2, 0.2),
            base: gRC(5.8, 0.2, 0.5),
            text: gRC(5.8, 1.0, 0.1),
        },
        baseXP: D(1e308),
        baseSpd: D(1e63),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(1)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Add ${format(eff, 2)} free levels to the Square pet.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(0.015).add(1)
            return eff
        },
        activeEffsDesc(eff) {
            return `Point Buyable 6 scales -${formatPerc(eff, 2)} slower.`
        }
    },
    dodecahedron: {
        number: 5,
        name: "Dodecahedron",
        chance: D(2000),
        colors: {
            fill: gRC(0.5, 0.85, 0.5),
            cannotEquip: gRC(0.5, 0.2, 0.2),
            base: gRC(0.5, 0.2, 0.5),
            text: gRC(0.5, 1.0, 0.1),
        },
        baseXP: D('e750'),
        baseSpd: D('e250'),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(12)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Add ${format(eff, 2)} free levels to the Pentagon pet.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = player.l.timeDodecahedronEquipped.max(0).div(20).add(1).ln().add(1).pow(eff.add(0.01).div(10).add(1).ln().mul(100))
            return eff
        },
        activeEffsDesc(eff) {
            return `Time this pet has been equipped boosts pets by &times;${format(eff, 2)}.`
        }
    },
    line: {
        number: 11,
        name: "Line",
        chance: D(0.3010299956639812), // 50% | 0.5 | -Math.log10(0.5)
        colors: {
            fill: gRC(3.5, 1.0, 1.0),
            cannotEquip: gRC(3.5, 0.2, 0.2),
            base: gRC(3.5, 0.2, 1.0),
            text: gRC(3.5, 1.0, 0.2),
        },
        baseXP: D(10),
        baseSpd: D(2),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.beam)
            eff = eff.mul(0.02).add(1)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Raise luck by ^${format(eff, 2)}.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.beam)
            eff = eff.pow_base(1.5)
            return eff
        },
        activeEffsDesc(eff) {
            return `Multiply luck by &times;${format(eff, 2)}`
        }
    },
    circle: {
        number: 12,
        name: "Circle",
        chance: D(0.6989700043360187), // 20% | 0.2 | -Math.log10(0.2)
        colors: {
            fill: gRC(2.0, 0.75, 1.0),
            cannotEquip: gRC(2.0, 0.2, 0.2),
            base: gRC(2.0, 0.2, 1.0),
            text: gRC(2.0, 1.0, 0.2),
        },
        baseXP: D(10),
        baseSpd: D(2),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.sphere)
            eff = eff.pow_base(1.1)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Raise point gain by ^${format(eff, 2)}`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.sphere)
            eff = eff.pow_base(2.5)
            return eff
        },
        activeEffsDesc(eff) {
            return `Multiply Point Buyable 5 clicks by &times;${format(eff, 2)}`
        }
    },
    triangle: {
        number: 13,
        name: "Triangle",
        chance: D(1.3010299956639812), // 5% | 0.05 | -Math.log10(0.05)
        colors: {
            fill: gRC(1.0, 0.75, 1.0),
            cannotEquip: gRC(1.0, 0.2, 0.2),
            base: gRC(1.0, 0.2, 1.0),
            text: gRC(1.0, 1.0, 0.1),
        },
        baseXP: D(10),
        baseSpd: D(2),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.pyramid)
            eff = eff.pow_base(1.1)
            if (eff.gte(1e100)) {
                eff = eff.log10().div(100).ln().add(1).mul(100).pow10()
            }
            return eff
        },
        passiveEffsDesc(eff) {
            return `Hyper Scaling Interval is decreased by ^${format(eff.recip(), 2)}`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.pyramid)
            eff = eff.mul(0.025).add(1)
            return eff
        },
        activeEffsDesc(eff) {
            return `Hyper Scaling Points are increased by ^${format(eff, 3)}`
        }
    },
    square: {
        number: 14,
        name: "Square",
        chance: D(5),
        colors: {
            fill: gRC(5.8, 0.75, 1.0),
            cannotEquip: gRC(5.8, 0.2, 0.2),
            base: gRC(5.8, 0.2, 1.0),
            text: gRC(5.8, 1.0, 0.2),
        },
        baseXP: D(10),
        baseSpd: D(2),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.cube)
            eff = eff.pow_base(1.01)
            if (eff.gte(100)) {
                eff = eff.div(100).ln().add(1).mul(100)
            }
            return eff
        },
        passiveEffsDesc(eff) {
            return `Point Buyable 4 scales -${formatPerc(eff, 2)} slower.`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.cube)
            eff = eff.pow_base(1.02)
            if (eff.gte(10000)) {
                eff = eff.div(10000).ln().add(1).mul(10000)
            }
            return eff
        },
        activeEffsDesc(eff) {
            return `Point Buyable 5 scales -${formatPerc(eff, 2)} slower.`
        }
    },
    pentagon: {
        number: 15,
        name: "Pentagon",
        chance: D(7),
        colors: {
            fill: gRC(0.5, 1.0, 1.0),
            cannotEquip: gRC(0.5, 0.2, 0.2),
            base: gRC(0.5, 0.2, 1.0),
            text: gRC(0.5, 1.0, 0.2),
        },
        baseXP: D(10),
        baseSpd: D(2),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.dodecahedron)
            eff = eff.pow_base(1.05)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Luck Dimension multipliers are increased by ^${format(eff, 2)}`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.add(tmp.l.petPassiveEffs.dodecahedron)
            eff = eff.pow_base(4/3).pow(player.p.timeInP.div(20).min(1))
            return eff
        },
        activeEffsDesc(eff) {
            return hasUpgrade('q', 31)
                ? `Point gain ^${format(eff, 3)}. (Caps at 20s)`
                : `In Super/Hyper Scaling, point gain ^${format(eff, 3)}. (Caps at 20s)`
        }
    },
    hexagon: {
        number: 16,
        name: "Hexagon",
        chance: D(10),
        colors: {
            fill: gRC(5.0, 1.0, 1.0),
            cannotEquip: gRC(5.0, 0.2, 0.2),
            base: gRC(5.0, 0.2, 1.0),
            text: gRC(5.0, 1.0, 0.2),
        },
        baseXP: D(1e15),
        baseSpd: D(10),
        baseScale: D(1.01),
        passiveEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.pow_base(1.05)
            return eff
        },
        passiveEffsDesc(eff) {
            return `Charge generation is increased by ^${format(eff, 2)}`
        },
        activeEffs(lv) {
            let eff = D(lv).sub(1)
            eff = eff.mul(0.01).add(1)
            return eff
        },
        activeEffsDesc(eff) {
            return hasMilestone('r', 4)
                ? `Decrease Tier scaling by -${formatPerc(eff, 2)}`
                : `Disable Tier automation but decrease Tier scaling by -${formatPerc(eff, 2)}`
        }
    },
}

addLayer('l', {
    name: "luck essence", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'L', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 1, // Row the layer is in on the tree (0 is the first row)
	branches: ['p'],
    hotkeys: [
        {key: 'l', description: "L: Reset for luck essence", onPress(){if (canReset('l')) doReset('l')}},
    ],
    layerShown(){ return challengeCompletions('q', 14).gte(1) || Decimal.gt(player.l.best, 0) },
    startData() { return {
        unlocked: false,
        points: D(0),
        bestPointsInL: D(0),
        timeInL: D(0),

        totalRolls: D(0),
        cooldownRand: D(1),
        lastRand: D(1),
        maxRand: D(1),

        totalRolls2: D(0),
        cooldownRand2: D(1),
        lastRand2: D(1),
        maxRand2: D(1),
        totalScore2: D(1),

        totalRolls3: D(0),
        cooldownRand3: D(1),
        lastRand3: D(1),
        maxRand3: D(1),
        totalScore3: D(1),

        rollPoints: D(0),
        rollPointGen: D(0),
        energy: D(0),
        totalEnergy: D(0),
        dimensionAccu: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
        pets: {
            // 2d
            line: D(0),
            circle: D(0),
            triangle: D(0),
            square: D(0),
            pentagon: D(0),
            hexagon: D(0),
            // 3d
            beam: D(0),
            sphere: D(0),
            pyramid: D(0),
            cube: D(0),
            dodecahedron: D(0)
        },
        petEquipped: [],
        petsGained: [],
        timeDodecahedronEquipped: D(0),
        bonuses: {
            // machines 1 and 2 can gain bonuses, machine 3 is unlocked, where every roll, score is:
            //     score = log2(2^score + YourRoll.ln().pow(3).div(100))
            // score multiplies chance of bonus gain by exactly score
            lucky: D(0), // chance: 5%, luck essence gain multiplied by x, m1 and m2 luck raised by log10(x)
            alternative: D(0), // chance: 2%, alt. prestige is raised by x, all alt. dims. are multiplied by x
            goldpet: D(0), // chance: 1%, pet gain is raised log10(x)/10, all equipped pets gain effectiveness over time
                // equipped = +goldpet time per second, time.div(10).add(1).log2().mul(0.01).mul(goldpet.add(1).log2()).add(1) times effectiveness
            rollBoost: D(0), // chance: 0.5%, M1 and M2's roll count is multiplied by x^2, M1 and M2's cooldown are decreased by /1+log10(x) (max /10)
            replication: D(0) // chance: 0.1%, Pets grow exponentially at x% rate, Roll points grow exponentially at x% rate 
        },
        goldpetEff: {
            // 2d
            line: D(0),
            circle: D(0),
            triangle: D(0),
            square: D(0),
            pentagon: D(0),
            hexagon: D(0),
            // 3d
            beam: D(0),
            sphere: D(0),
            pyramid: D(0),
            cube: D(0),
            dodecahedron: D(0)
        }
    }},
    color: "#ffff00",
    requires: D('e9e15'), // Can be a function that takes requirement increases into account
    resource: "luck essence", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        if (player.l.petEquipped.length > 0) {
            player.r.valid[4] = false
        }
        if (player.l.total.gt(hasMilestone('r', 3) ? 10 : 0)) {
            player.r.valid[5] = false
        }

        if (challengeCompletions('a', 13).gte(1)) {
            if (!player.r.safeguards[5]) {
                let gen = tmp.l.getResetGain

                player.l.points = player.l.points.add(gen.mul(diff).mul(player.globalTS))
                player.l.total = player.l.total.add(gen.mul(diff).mul(player.globalTS))
                player.l.best = player.l.best.max(player.l.points)
            }
        }

        if (hasUpgrade('l', 31)) {
            clickClickable('l', 11)
        }

        if (hasMilestone('r', 8)) {
            clickClickable('l', 12)
        }

        if (player.l.petEquipped.includes('dodecahedron')) {
            player.l.timeDodecahedronEquipped = player.l.timeDodecahedronEquipped.add(player.globalTS.mul(diff))
        }

        player.l.timeInL = player.l.timeInL.add(player.globalTS.mul(diff))

        player.l.cooldownRand = player.l.cooldownRand.sub(player.globalTS.mul(diff)).max(0)
        player.l.maxRand = Decimal.max(player.l.maxRand, player.l.lastRand)

        player.l.cooldownRand2 = player.l.cooldownRand2.sub(player.globalTS.mul(diff)).max(0)
        player.l.maxRand2 = Decimal.max(player.l.maxRand2, player.l.lastRand2)

        if (hasUpgrade('l', 15)) {
            // goes backwards because higher dims need to be prioritized
            // ends at 1 because i-1 at 0 crashes (-1 index)
            for (let i = 7; i >= 1; i--) {
                player.l.dimensionAccu[i-1] = player.l.dimensionAccu[i-1].add(
                    player.l.dimensionAccu[i].add(player.l.buyables[11 + i]).mul(tmp.l.buyables[11 + i].effect).mul(diff)
                )
            }

            player.l.energy = player.l.energy.add(tmp.l.energyPS.mul(diff))
            player.l.totalEnergy = player.l.totalEnergy.add(tmp.l.energyPS.mul(diff))
        }

        if (hasUpgrade('l', 16)) {
            let gen2 = tmp.l.rollPointGain.mul(player.globalTS)
            player.l.rollPointGen = player.l.rollPointGen.add(gen2.mul(diff))
        }

        let gen = player.l.rollPointGen.mul(player.globalTS)
        player.l.rollPoints = player.l.rollPoints.add(gen.mul(diff))

        if (hasUpgrade('q', 14)) {
            for (let i = 0; i < 8; i++) {
                tmp.l.buyables[11 + i].buyMax()
            }
        }

        if (hasUpgrade('q', 15) || hasUpgrade('l', 32)) {
            tmp.l.buyables[21].buyMax()
            tmp.l.buyables[22].buyMax()
            tmp.l.buyables[23].buyMax()
            tmp.l.buyables[31].buyMax()
            tmp.l.buyables[32].buyMax()
            tmp.l.buyables[33].buyMax()
            tmp.l.buyables[41].buyMax()
            tmp.l.buyables[42].buyMax()
            if (hasUpgrade('l', 32)) {
                tmp.l.buyables[43].buyMax()
            }
        }
    },
    effect(){
        let i = player.l.total.max(1).log10().add(1)
        return i
    },
    effectDescription(){
        return ` which is raising your luck by ^${format(tmp.l.effect, 3)}.`
    },
    getRequire() {
        let i = new Decimal('e9e15')
        return i
    },
    canReset() {
        if (player.r.safeguards[5]) {
            return false
        }
        return tmp.l.getResetGain.gte(1)
    },
    getResetGain() {
        let i = player.points.lt('e9e15') 
            ? D(0) 
            : player.points.log10().div(9e15).log(1000).add(1).pow(2)

        if (!challengeCompletions('a', 13).gte(1)) {
            i = i.sub(player.l.total)
        }
        i = i.floor().max(0)
        return i
    },
    getNextAt() {
        let i = tmp.l.getResetGain
        if (!challengeCompletions('a', 13).gte(1)) {
            i = i.add(player.l.total)
        }

        i = i.add(1).root(2).sub(1).pow_base(1000).mul(9e15).pow10()
        return i
    },
    prestigeButtonText(){
        let gain = tmp.l.getResetGain
        let nextAt = tmp.l.getNextAt

        let amt = "You can reset for " + format(gain) + " Luck Essence"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    doReset() {
        tmp.q.doReset(true)
    },
    luckMult() {
        const arr = []

        // roll point roll for index 0
        let i = D(1)
        i = i.mul(tmp.l.energyEff.normal)
        i = i.mul(tmp.l.buyables[23].effect)
        if (player.l.petEquipped.includes('line')) {
            i = i.mul(tmp.l.petActiveEffs.line)
        }
        i = i.mul(player.l.totalScore2)
        if (hasUpgrade('l', 35)) {
            i = i.mul(upgradeEffect('l', 35).m1)
        }
        if (hasUpgrade('l', 44)) {
            i = i.mul(upgradeEffect('l', 44).m1)
        }
        arr.push(i)
        
        // booster roll for index 1
        i = D(1)
        if (hasUpgrade('l', 35)) {
            i = i.mul(upgradeEffect('l', 35).m2)
        }
        if (hasUpgrade('l', 44)) {
            i = i.mul(upgradeEffect('l', 44).m2)
        }
        arr.push(i)

        return arr
    },
    luckPow() {
        const arr = []

        // roll point roll for index 0
        let i = D(1)
        i = i.mul(tmp.l.effect)
        if (hasUpgrade('l', 13)) {
            i = i.mul(upgradeEffect('l', 13).luck)
        }
        i = i.mul(tmp.l.petPassiveEffs.line)
        if (challengeCompletions('p', 12).gte(16)) {
            i = i.mul(1.04)
        }
        if (challengeCompletions('p', 12).gte(17)) {
            i = i.mul(1.04)
        }
        if (challengeCompletions('p', 12).gte(18)) {
            i = i.mul(1.04)
        }
        if (challengeCompletions('p', 12).gte(19)) {
            i = i.mul(1.04)
        }
        if (challengeCompletions('p', 12).gte(20)) {
            i = i.mul(1.1)
        }
        if (hasUpgrade('q', 25)) {
            i = i.mul(1.1)
        }
        if (player.l.petEquipped.includes('beam')) {
            i = i.mul(tmp.l.petActiveEffs.beam)
        }
        i = i.mul(tmp.r.challenges[16].rewardEffect.curr)
        if (hasUpgrade('l', 43)) {
            i = i.mul(upgradeEffect('l', 43).luck)
        }
        if (challengeCompletions('a', 14).gte(1)) {
            i = i.mul(tmp.a.challenges[14].rewardEffect)
        }
        arr.push(i)
        
        // booster roll for index 1
        i = D(1)
        if (hasUpgrade('l', 36)) {
            i = i.mul(upgradeEffect('l', 36))
        }
        i = i.mul(tmp.r.challenges[16].rewardEffect.curr)
        if (hasUpgrade('l', 45)) {
            i = i.mul(upgradeEffect('l', 45))
        }
        arr.push(i)

        return arr
    },
    rollLol(index) {
        let i = new Decimal(Math.random())
        i = i.max(1e-6) // too lucky to get NaNs, 1/1,000,000 chance (go to sols rng for that lmao)
        i = i.recip()

        i = i.mul(tmp.l.luckMult[index])
        i = i.pow(tmp.l.luckPow[index])
        return i
    },
    rollPointGain() {
        let i = player.l.maxRand
        i = i.mul(tmp.l.energyEff.normal)
        if (hasUpgrade('l', 16)) {
            i = i.mul(player.l.totalRolls)
        }
        if (hasUpgrade('l', 22)) {
            i = i.mul(player.l.rollPoints.max(10).log10().pow(upgradeEffect('l', 22)))
        }
        i = i.mul(tmp.l.buyables[21].effect)
        i = i.pow(tmp.q.buyables[23].effect)
        return i
    },
    energyPS() {
        return player.l.dimensionAccu[0].add(player.l.buyables[11]).mul(tmp.l.buyables[11].effect).mul(player.globalTS)
    },
    energyEff() {
        let i = player.l.totalEnergy
        i = {
            normal: i.max(1).log10().div(10).add(1).pow(2.2).pow(tmp.l.buyables[33].effect).add(i.div(1e24).max(1).pow(0.2).sub(1).min(1e7).mul(i.max(1e59).log10().div(59).pow(4))),
            prest: i.max(1).log2().add(1).add(i.pow(0.1))
        }
        if (hasUpgrade('q', 14)) {
            i.normal = i.normal.max(1).log10().pow(1.1).pow10()
            i.prest = i.prest.max(1).log10().pow(1.25).pow10()
        }
        if (challengeCompletions('p', 12).gte(16)) {
            i.prest = i.prest.pow(1.1)
        }
        return i
    },
    petLevels() {
        const obj = {}
        for (let pet in player.l.pets) {
            obj[pet] = PET_FORMULAE.xp_to_level(pet, player.l.pets[pet])
        }
        return obj
    },
    petUnlocked() {
        const obj = {}
        for (let pet in player.l.pets) {
            obj[pet] = false

            switch (pet) {
                case "line":
                case "circle":
                case "triangle":
                    obj[pet] = challengeCompletions('p', 12).gte(14)
                    break;
                case "square":
                case "pentagon":
                    obj[pet] = challengeCompletions('p', 12).gte(18)
                    break;
                case "beam":
                case "hexagon":
                    obj[pet] = hasUpgrade('q', 31)
                    break;
                case "sphere":
                case "pyramid":
                    obj[pet] = hasMilestone('r', 3)
                    break;
                case "cube":
                case "dodecahedron":
                    obj[pet] = hasUpgrade('q', 45)
                    break;
            }
        }
        return obj
    },
    petPassiveEffs() {
        const obj = {}
        for (let pet in player.l.pets) {
            if (PET_DATA[pet] != undefined) {
                obj[pet] = PET_DATA[pet].passiveEffs(tmp.l.petLevels[pet].floor())
            } else {
                obj[pet] = 1
            }
        }
        return obj
    },
    petActiveEffs() {
        const obj = {}
        for (let pet in player.l.pets) {
            if (PET_DATA[pet] != undefined) {
                obj[pet] = PET_DATA[pet].activeEffs(tmp.l.petLevels[pet].floor())
            } else {
                obj[pet] = 1
            }
        }
        return obj
    },
    petPassiveEffDesc() {
        const obj = {}
        for (let pet in player.l.pets) {
            if (PET_DATA[pet] != undefined) {
                obj[pet] = PET_DATA[pet].passiveEffsDesc(tmp.l.petPassiveEffs[pet])
            } else {
                obj[pet] = 1
            }
        }
        return obj
    },
    petActiveEffDesc() {
        const obj = {}
        for (let pet in player.l.pets) {
            if (PET_DATA[pet] != undefined) {
                obj[pet] = PET_DATA[pet].activeEffsDesc(tmp.l.petActiveEffs[pet])
            } else {
                obj[pet] = 1
            }
        }
        return obj
    },
    // doesn't need to be Decimal because there's way less than 1.8e308 pets
    petEquipCap() {
        let i = 1
        if (hasUpgrade('q', 13)) {
            i += 1
        }
        if (hasUpgrade('q', 31)) {
            i += 1
        }
        if (hasUpgrade('q', 32)) {
            i += 1
        }
        if (hasUpgrade('q', 33)) {
            i += 2
        }
        if (hasMilestone('r', 3)) {
            i += 1
        }
        if (hasUpgrade('q', 45)) {
            i += 1
        }
        return i
    },
    petLuckPow() {
        let i = D(1)
        i = i.mul(tmp.l.buyables[42].effect)
        if (hasUpgrade('q', 14)) {
            i = i.mul(upgradeEffect('q', 14))
        }
        i = i.mul(tmp.r.challenges[16].rewardEffect.curr)
        return i
    },
    bonusScore() {
        let score = Object.values(player.l.bonuses).reduce((total, item) => { return total.log2().mul(item.add(1).log2().add(1)).pow_base(2) }, D(2)).log2()
        return score
    },
    bonusPtsGain() {
        let gain = tmp.l.bonusScore.sub(1)
        return gain
    },
    upgrades: {
        11: {
            title: "Yay, gambling!",
            description: "Your best roll raises point gain.",
            cost: new Decimal(1000),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = player.l.maxRand.log10().div(20).add(1)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)}` }, 
        },
        12: {
            title: "Yay, gambling?",
            description: "Your best roll boosts Prestige Dimension multipliers.",
            cost: new Decimal(10000),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = player.l.maxRand
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 2)}` }, 
        },
        13: {
            title: "\"Lose all your money...\"",
            description: "Every roll, trade 10% of your Point Buyable 5 clicks for extra luck. Your highest luck boosts Buyable 5 clicks.",
            cost: new Decimal(100000),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = {
                    luck: player.p.buyable5Clicks.div(1e12).max(1).log(1.1).max(0).floor().mul(0.005).add(1),
                    clicks: player.l.maxRand.max(10).log10().pow(1.667)
                }
                return ret;
            },
            effectDisplay() { return `^${format(this.effect().luck, 3)} to luck, &times;${format(this.effect().clicks, 2)} to clicks` }, 
        },
        14: {
            title: "\"...you stupid beach!\"",
            description: "Your luck essence boosts Prestige Dimension mult per bought and Hyper Scaling Buyable 1's effect base.",
            cost: new Decimal(1e6),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = player.l.total.mul(0.05)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 2)}` }, 
        },
        15: {
            title: "Too many",
            description: "Unlock Luck Dimensions.",
            cost: new Decimal(1e7),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        16: {
            title: "Annoying Clicking",
            description: "Gain RPG and Buyable 5 Clicks equivalent to physically clicking them 1 time per second. Roll Point Gain is multiplied by amount of times rolled.",
            cost: new Decimal(1e39),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = player.l.totalRolls
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect())} to RP` }, 
        },
        21: {
            title: "Missing Upgrade",
            description: "Unlock 7 more Prestige Dimension-related upgrades.",
            cost: new Decimal(1e10),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        22: {
            title: "Self-Synergy",
            description: "Roll Points and Luck Dimension multipliers boost themselves.",
            cost: new Decimal(1e12),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = D(1)
                ret = ret.add(tmp.l.buyables[31].effect)
                return ret;
            },
            effectDisplay() { return `&times;log10(x)<sup>${format(this.effect(), 2)}</sup>` }, 
        },
        23: {
            title: "Cross Contamination",
            description: "Luck Dimensions bought give free levels to Prestige Dimensions.",
            cost: new Decimal(1e18),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = D(5)
                ret = ret.add(tmp.l.buyables[32].effect)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 1)}&times;log10(x)` }, 
        },
        24: {
            title: "RNGesus sends their regards",
            description: "Your best roll increases Luck Dimension multipliers.",
            cost: new Decimal(1e20),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = player.l.maxRand.div(1e9).max(1).log10().root(3).pow10()
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 1)}` }, 
        },
        25: {
            title: "Free Level Acceleration",
            description: "Prestige Dimensions give free levels based on their *accumulated* amount instead of their bought amount.",
            cost: new Decimal(1e36),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        26: {
            title: "No longer no PB2",
            description: "The No PB2 challenge gains 10 more max completions",
            cost: new Decimal(1e45),
            unlocked() { return true },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        31: {
            title: "Gambling Addiction",
            description: "Automatically roll and gain B5 clicks every second.",
            cost: new Decimal(1e6),
            unlocked() { return hasMilestone('r', 0) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        32: {
            title: "True Gambler",
            description: "Automate all Luck Buyables.",
            cost: new Decimal(1e100),
            unlocked() { return hasMilestone('r', 0) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        33: {
            title: "Multi-Machine Gamble",
            description: "Add an extra clickable that determines your luck increase and pet multiplier.<br>NOTE: All previous mentions of 'luck' affect Machine 1's luck!",
            cost: new Decimal('e1000'),
            unlocked() { return hasMilestone('r', 0) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        34: {
            title: "Take the Wheel",
            description: "Weaken the Luck Buyable #1 cost scaling in general.",
            cost: new Decimal('e10000'),
            unlocked() { return hasMilestone('r', 0) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        35: {
            title: "Rigged in Your Favor",
            description: "For both machines, your luck is multiplied based on your best roll.",
            cost: new Decimal('e100000'),
            unlocked() { return hasMilestone('r', 0) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = {
                    m1: player.l.maxRand.max(1e10).log10().log(5).add(1).pow(2).pow10(),
                    m2: player.l.maxRand2.max(1).log10().add(1).pow(2)
                }
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect().m1)} to M1, &times;${format(this.effect().m2, 2)} to M2` }, 
        },
        36: {
            title: "You Are The House",
            description: "Luck Essence boosts Machine 2's luck at a reduced rate.",
            cost: new Decimal('e1000000'),
            unlocked() { return hasMilestone('r', 0) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = tmp.l.effect.root(2)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 2)}` }, 
        },
        41: {
            title: "Kept with the Times",
            description: "Luck Buyable 7's effect is improved.",
            cost: new Decimal('ee7'),
            unlocked() { return hasMilestone('r', 4) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        42: {
            title: "Manipulate the Wheel",
            description: "Luck Buyable 1's cost is heavily weakened.",
            cost: new Decimal('ee8'),
            unlocked() { return hasMilestone('r', 4) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
        43: {
            title: "Casino Bonuses",
            description: "Machine 1's luck and pet gain are increased the more times you roll Machine 1.",
            cost: new Decimal('ee9'),
            unlocked() { return hasMilestone('r', 4) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = {
                    luck: player.l.totalRolls.div(1000).add(1).ln().div(10).add(1),
                    pet: player.l.totalRolls.root(4).pow10().add(player.l.totalRolls),
                }
                return ret;
            },
            effectDisplay() { return `^${format(this.effect().luck, 3)} M1 luck, &times;${format(this.effect().pet, 2)} pet gain` }, 
        },
        44: {
            title: "Extended Bonuses",
            description: "Machine 1 and Machine 2's best rolls boost each others' luck.",
            cost: new Decimal('ee10'),
            unlocked() { return hasMilestone('r', 4) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = {
                    m1: player.l.maxRand2.max(1).log10().pow(1.25).pow10(),
                    m2: player.l.maxRand.max(10).log10().log10().pow(1.5),
                }
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect().m1, 3)} M1 luck, &times;${format(this.effect().m2, 2)} M2 luck` }, 
        },
        45: {
            title: "Super VIP",
            description: "Machine 2's luck is increased the more times you roll Machine 2.",
            cost: new Decimal('ee12'),
            unlocked() { return hasMilestone('r', 4) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
            effect() { 
                let ret = player.l.totalRolls2.div(20).add(1).ln().div(10).add(1)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 3)}` }, 
        },
        46: {
            title: "Machine Improvements",
            description: "[unimp.] Both Machines now give a chance for bonuses, which can increase best roll, alt. dimensions, etc.",
            cost: new Decimal('ee24'),
            unlocked() { return hasMilestone('r', 4) },
            currencyInternalName: 'rollPoints',
            currencyDisplayName: 'Roll Points',
            currencyLocation() {
                return player.l
            },
        },
    },
    buyables: (() => {
        const upgrades = {
            ...(() => {
                const obj = {};
                for (let i = 0; i < 8; i++) {
                    obj[11 + i] = {
                        type: 0,
                        num: i + 1,
                        get costD() {
                            return  {
                                type: 1, exp: i === 7 ? 1 : 0, 
                                main: [
                                    [D(1e7), D(100), D(1e4), D(1e6), D(1e10), D(1e15), D(1e22), D(30)][i],
                                    [D(2),   D(2),   D(3),   D(5),   D(8),    D(10),   D(10),   D(1.034)][i],
                                    [D(1.2), D(2),   D(2.2), D(2.4), D(2.6),  D(2.8),  D(3),    D(1.1)][i]
                                ]
                            }
                        },
                        unlocked() { return i === 0 || (player.l.buyables[10 + i] ?? D(0)).gte(1) },
                        unavail() {
                            let x = false
                            return x
                        },
                        preEffect(x, override) {
                            let eff = D(x)

                            let j = D(2)
                            
                            eff = Decimal.pow(j, eff.sub(1).max(0))
                            if (hasUpgrade('l', 22)) {
                                eff = eff.mul(eff.max(10).log10().pow(upgradeEffect('l', 22)))
                            }
                            if (hasUpgrade('l', 24)) {
                                eff = eff.mul(upgradeEffect('l', 24))
                            }
                            if (i === 0) {
                                if (challengeCompletions('p', 12).gte(16)) {
                                    eff = eff.pow(1.1)
                                }
                            }
                            eff = eff.pow(tmp.l.petPassiveEffs.pentagon)
                            return eff;
                        },
                        dispEffect() {
                            const currEffect = this.effect(player.l.buyables[11 + i])
                            return `This dimension's multiplier is increased by &times;${format(currEffect, 1)}.`
                        },
                        dispEffBase() {
                            const currEffect = this.effect(player.l.buyables[11 + i])
                            const nextEffect = this.effect(player.l.buyables[11 + i].add(1))
                            if (player.l.buyables[11 + i].gte(1e12)) {
                                return `This dimension's multiplier is increased by &times;${format(nextEffect.root(player.l.buyables[11 + i]), 1)}.` 
                            } else {
                                return `This dimension's multiplier is increased by &times;${format(nextEffect.div(currEffect), 1)}.` 
                            }
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
            21: {
                type: 1,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(1e40), D(5), D(1.01)]}
                    if (hasUpgrade('l', 34)) {
                        obj.type = 1
                        obj.main[2] = D(1.2)
                        if (hasUpgrade('l', 42)) {
                            obj.main[2] = D(1.05)
                        }
                    }
                    return obj
                },
                unlocked() { return challengeCompletions('p', 12).gte(11) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(2)
                    if (hasUpgrade('q', 12)) {
                        j = j.add(0.2)
                    }
                    
                    eff = Decimal.pow(j, eff)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[21])
                    return `Roll Points are increased by &times;${format(currEffect, 1)}.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[21])
                    const nextEffect = this.effect(player.l.buyables[21].add(1))
                    if (player.l.buyables[21].gte(1e12)) {
                        return `Roll Points are increased by &times;${format(nextEffect.root(player.l.buyables[21]), 1)}.` 
                    } else {
                        return `Roll Points are increased by &times;${format(nextEffect.div(currEffect), 1)}.` 
                    }
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
                costD: {type: 0, exp: 0, main: [D(1e45), D(8), D(1.04)]},
                unlocked() { return challengeCompletions('p', 12).gte(11) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(1.5)
                    if (hasUpgrade('q', 12)) {
                        j = j.add(0.1)
                    }
                    
                    eff = Decimal.pow(j, eff)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[22])
                    return `Point Buyable 5 clicks are increased by &times;${format(currEffect, 1)}.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[22])
                    const nextEffect = this.effect(player.l.buyables[22].add(1))
                    if (player.l.buyables[22].gte(1e12)) {
                        return `Point Buyable 5 clicks are increased by &times;${format(nextEffect.root(player.l.buyables[22]), 1)}.` 
                    } else {
                        return `Point Buyable 5 clicks are increased by &times;${format(nextEffect.div(currEffect), 1)}.` 
                    }
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
                get costD() {
                    const obj = {type: 0, exp: 1, main: [D(50), D(1.04), D(1.001)]}
                    // stupid bullshit
                    if (player.q.upgrades.includes(27)) {
                        obj.main[2] = D(1)
                    }
                    return obj
                },
                unlocked() { return challengeCompletions('p', 12).gte(11) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(1.6)
                    if (hasUpgrade('q', 12)) {
                        j = j.add(0.05)
                    }
                    
                    eff = Decimal.pow(j, eff)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[23])
                    return `Luck is increased by &times;${format(currEffect, 1)}.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[23])
                    const nextEffect = this.effect(player.l.buyables[23].add(1))
                    if (player.l.buyables[23].gte(1e12)) {
                        return `Luck is increased by &times;${format(nextEffect.root(player.l.buyables[23]), 1)}.` 
                    } else {
                        return `Luck is increased by &times;${format(nextEffect.div(currEffect), 1)}.` 
                    }
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
                costD: {type: 1, exp: 0, main: [D(1e63), D(1000), D(1.25)]},
                unlocked() { return challengeCompletions('p', 12).gte(11) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(0.25)
                    
                    eff = Decimal.mul(j, eff)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[31])
                    return `Add +${format(currEffect, 2)} to Self-Synergy's effect.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[31])
                    const nextEffect = this.effect(player.l.buyables[31].add(1))
                    if (player.l.buyables[31].gte(1e12)) {
                        return `Add +${format(nextEffect.div(player.l.buyables[31]), 2)} to Self-Synergy's effect.` 
                    } else {
                        return `Add +${format(nextEffect.sub(currEffect), 2)} to Self-Synergy's effect.` 
                    }
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
                costD: {type: 1, exp: 0, main: [D(1e93), D(1000), D(1.5)]},
                unlocked() { return challengeCompletions('p', 12).gte(11) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(1)
                    
                    eff = Decimal.mul(j, eff)
                    if (hasUpgrade('q', 26)) {
                        eff = eff.pow(1.1)
                    }
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[32])
                    return `Add +${format(currEffect, 1)} to Cross Contamination's effect.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[32])
                    const nextEffect = this.effect(player.l.buyables[32].add(1))
                    if (player.l.buyables[32].gte(1e12)) {
                        return `Add +${format(nextEffect.div(player.l.buyables[32]), 1)} to Cross Contamination's effect.` 
                    } else {
                        return `Add +${format(nextEffect.sub(currEffect), 1)} to Cross Contamination's effect.` 
                    }
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
                costD: {type: 1, exp: 0, main: [D(1e123), D(1000), D(1.75)]},
                unlocked() { return challengeCompletions('p', 12).gte(11) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    eff = sumHarmonicSeries(eff.add(1).max(1)).add(1)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[33])
                    let withEffTotal = player.l.totalEnergy.max(1).log10().div(10).add(1).pow(2.2).pow(currEffect).add(player.l.totalEnergy.div(1e24).max(1).pow(0.2).sub(1).min(1e7).mul(player.l.totalEnergy.max(1e59).log10().div(59).pow(4)))
                    let withoutEffTotal = player.l.totalEnergy.max(1).log10().div(10).add(1).pow(2.2).add(player.l.totalEnergy.div(1e24).max(1).pow(0.2).sub(1).min(1e7).mul(player.l.totalEnergy.max(1e59).log10().div(59).pow(4)))

                    if (hasUpgrade('q', 14)) {
                        withEffTotal = withEffTotal.max(1).log10().pow(1.1).pow10()
                        withoutEffTotal = withoutEffTotal.max(1).log10().pow(1.1).pow10()
                    }
                    return `Raise Luck Energy's luck and RP effect base by ^${format(currEffect, 2)}. This multiplies luck and Roll Points by &times;${format(withEffTotal.div(withoutEffTotal), 2)}.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[33])
                    const nextEffect = this.effect(player.l.buyables[33].add(1))
                    let currEffTotal = player.l.totalEnergy.max(1).log10().div(10).add(1).pow(2.2).pow(currEffect).add(player.l.totalEnergy.div(1e24).max(1).pow(0.2).sub(1).min(1e7).mul(player.l.totalEnergy.max(1e59).log10().div(59).pow(4)))
                    let nextEffTotal = player.l.totalEnergy.max(1).log10().div(10).add(1).pow(2.2).pow(nextEffect).add(player.l.totalEnergy.div(1e24).max(1).pow(0.2).sub(1).min(1e7).mul(player.l.totalEnergy.max(1e59).log10().div(59).pow(4)))

                    if (hasUpgrade('q', 14)) {
                        currEffTotal = currEffTotal.max(1).log10().pow(1.1).pow10()
                        nextEffTotal = nextEffTotal.max(1).log10().pow(1.1).pow10()
                    }
                    if (player.l.buyables[33].gte(1e12)) {
                        return `Raise Luck Energy's luck and RP effect base by +^${format(nextEffect.div(player.l.buyables[33]), 2)}. This multiplies luck and Roll Points by &times;${format(nextEffTotal.div(currEffTotal), 2)}.`
                    } else {
                        return `Raise Luck Energy's luck and RP effect base by +^${format(nextEffect.sub(currEffect), 2)}. This multiplies luck and Roll Points by &times;${format(nextEffTotal.div(currEffTotal), 2)}.`
                    }
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
                costD: {type: 0, exp: 0, main: [D(1e303), D(1e10), D(10)]},
                unlocked() { return challengeCompletions('p', 12).gte(14) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(0.5)
                    
                    if (hasUpgrade('l', 41)) {
                        eff = Decimal.mul(j, eff).mul(Decimal.pow(j.exp(), eff.div(100).max(1).ln().div(100).add(1).pow(50).sub(1)))
                    } else {
                        eff = Decimal.mul(j, eff)
                    }

                    eff = eff.add(1)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[41])
                    return `Gain &times;${format(currEffect, 2)} more pets.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[41])
                    const nextEffect = this.effect(player.l.buyables[41].add(1))
                    if (hasUpgrade('l', 41)) {
                        if (player.l.buyables[41].gte(1e12)) {
                            return `Gain &times;${format(nextEffect.root(player.l.buyables[41]), 2)} more pets.` 
                        } else {
                            return `Gain &times;${format(nextEffect.div(currEffect), 2)} more pets.` 
                        }
                    } else {
                        if (player.l.buyables[41].gte(1e12)) {
                            return `Gain +&times;${format(nextEffect.div(player.l.buyables[41]), 2)} more pets.` 
                        } else {
                            return `Gain +&times;${format(nextEffect.sub(currEffect), 2)} more pets.` 
                        }
                    }
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
                costD: {type: 0, exp: 1, main: [D(400), D(1.05), D(1.001)]},
                unlocked() { return challengeCompletions('p', 12).gte(14) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)
                    if (!override) {
                        eff = eff.mul(tmp.l.buyables[43].effect)
                    }

                    let j = D(0.1)
                    
                    eff = Decimal.mul(j, eff)
                    eff = eff.add(1)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[42])
                    return `Increase pet luck by ^${format(currEffect, 2)}.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[42])
                    const nextEffect = this.effect(player.l.buyables[42].add(1))
                    if (player.l.buyables[42].gte(1e12)) {
                        return `Increase pet luck by +^${format(nextEffect.div(player.l.buyables[42]), 2)}.` 
                    } else {
                        return `Increase pet luck by +^${format(nextEffect.sub(currEffect), 2)}.` 
                    }
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
                costD: {type: 0, exp: 1, main: [D(500), D(1.1), D(1.01)]},
                unlocked() { return challengeCompletions('p', 12).gte(14) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let eff = D(x)

                    if (!override) {

                    }

                    eff = eff.mul(0.25).add(1).ln().mul(0.04).add(1)
                    return eff;
                },
                dispEffect() {
                    const currEffect = this.effect(player.l.buyables[43])
                    return `Increase all point, prestige, and luck buyables' effectiveness (except for this) by +${format(currEffect.sub(1).mul(100), 2)}%.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.l.buyables[43])
                    const nextEffect = this.effect(player.l.buyables[43].add(1))
                    if (player.l.buyables[43].gte(1e12)) {
                        return `Increase all point, prestige, and luck buyables' effectiveness (except for this) by +${format(nextEffect.div(player.l.buyables[43]).mul(100), 2)}%.` 
                    } else {
                        return `Increase all point, prestige, and luck buyables' effectiveness (except for this) by +${format(nextEffect.sub(currEffect).mul(100), 2)}%.` 
                    }
                },
                scaleModifEffective(x) {
                    if (hasUpgrade('q', 21)) {
                        x = x.div(upgradeEffect('q', 21))
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (hasUpgrade('q', 21)) {
                        x = x.mul(upgradeEffect('q', 21))
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
        };

        // ! NOTE!! 'l' doesn't work in the custom buyable script TwT
        for (const upgrade of Object.values(upgrades)) {
            upgrade.effect = (x) => {
                if (upgrade.unavail()) { 
                    return upgrade.preEffect(D(0), true)
                }
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected as input in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }

                let eff = upgrade.preEffect(D(x), false)
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected as effect in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }
                return eff
            }

            upgrade.cost = (x) => {
                if (upgrade.unavail()) { return D(Infinity) }

                let i, j, k;
                j = x
                k = upgrade.costD.main

                if (upgrade.type === 0 || upgrade.type === 1) {
                    if (inChallenge('a', 14)) {
                        j = j.div(1).pow(tmp.a.challenges[14].getDepths).sub(1).div(tmp.a.challenges[14].getDepths).exp().mul(1)
                    }
                }

                j = upgrade.scaleModifEffective(j)

                if (upgrade.costD.type === 0) {
                    i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);
                } else if (upgrade.costD.type === 1) {
                    i = Decimal.pow(k[1], j.pow(k[2])).mul(k[0]);
                }

                i = i.layeradd10(upgrade.costD.exp)
                i = upgrade.scaleModifCost(i)
                return i.round()
            }

            upgrade.target = () => {
                if (upgrade.unavail()) { return D(-1e-12) }

                if (upgrade.type === 0) {
                    if (upgrade.num === 1) {
                        x = player[upgrade.layer].rollPoints;
                    } else {
                        x = player[upgrade.layer].energy;
                    }
                }
                if (upgrade.type === 1) {
                    x = player[upgrade.layer].rollPoints;
                }
                
                if (x.lt(upgrade.costD.main[0])) { return D(-1e-12) }

                let i, j;
                i = D(x)
                j = upgrade.costD.main
                if (Decimal.isNaN(i)) {
                    throw new Error(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected in target resource!`)
                }
                i = upgrade.scaleModifTarCost(i)

                if (Decimal.isNaN(i)) {
                    console.info(`PROBLEM FUNCTION:`)
                    console.info(upgrade.scaleModifTarCost)
                    throw new Error(`[Layer: l, Type: buyable, ID: ${upgrade.id}]NaN detected in target of id${upgrade.id} after modifier target cost!`)
                }
                i = i.layeradd10(-upgrade.costD.exp)

                if (Decimal.isNaN(i)) {
                    // it's likely only NaN because the value is too low and the amount of logs would make it NaN
                    // or something earlier up has caused crap to happen, make it default into a 0 value
                    console.warn(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} before scaling!`)
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
                    console.warn(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after main scaling! (main scaling causing NaN?)`)
                    return D(0)
                }

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after modifers before scaleModifTarEff! (modifiers causing NaN?)`)
                    return D(0)
                }

                i = upgrade.scaleModifTarEff(i)

                if (upgrade.type === 0 || upgrade.type === 1) {
                    if (inChallenge('a', 14)) {
                        i = i.max(1).div(1).ln().mul(tmp.a.challenges[14].getDepths).add(1).root(tmp.a.challenges[14].getDepths).mul(1)
                    }
                }

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: l, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after scaleModifTarEff! (scaleModifTarEff causing NaN?)`)
                    return D(0)
                }
                return i
            }

            upgrade.title = () => { 
                if (upgrade.type === 0) {
                    return `Luck Dimension ${upgrade.num}`
                }
                if (upgrade.type === 1) {
                    return `Luck Buyable ${upgrade.num}`
                }
            },

            upgrade.stupidHack = () => {
                return shiftDown
            }

            upgrade.display = () => {
                // console.log(`%cbuyable id ${upgrade.id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
                let txt;
                if (upgrade.type === 0) {
                    txt = `Amount: ${format(player[upgrade.layer].dimensionAccu[upgrade.num - 1])} (${format(player[upgrade.layer].buyables[upgrade.id])}), Mult: &times;${format(upgrade.effect(player[upgrade.layer].buyables[upgrade.id]))}<br>`
                }
                if (upgrade.type === 1) {
                    txt = `You have ${format(player[upgrade.layer].buyables[upgrade.id], 0)} Luck Buyable ${upgrade.num}.<br>`
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
                        txt += `${format(upgrade.costD.main[0])}`
                        if (upgrade.costD.main[1].gt(1)) {
                            txt += ` × ${format(upgrade.costD.main[1], 2)}<sup>n</sup>`
                        }
                        if (upgrade.costD.main[2].gt(1)) {
                            txt += ` × ${format(upgrade.costD.main[2], 3)}<sup>n<sup>2</sup></sup>`
                        }
                    } else if (upgrade.costD.type === 1) {
                        txt += `${format(upgrade.costD.main[0])} × ${format(upgrade.costD.main[1], 2)}<sup>n<sup>${format(upgrade.costD.main[2], 3)}</sup></sup>`
                    }
                    if (upgrade.costD.exp >= 1) { 
                        for (let i = 0; i < upgrade.costD.exp; i++) {
                            txt += `</sup>` 
                        }
                    }

                    // let hasExtra = false
                    // if (upgrade.type === 0 && upgrade.num === 4) {
                    //     if (!hasExtra) {
                    //         txt += `<br>`
                    //     }
                    //     txt += `<br>Scales exponentially after ${format(100)} purchases.`
                    // }
                } else {
                    txt += `Effect: `
                    txt += upgrade.dispEffect() 
                    txt += `<br>Cost: ${format(upgrade.cost())} `
                    if (upgrade.type === 0) {
                        if (upgrade.num === 1) {
                            txt += `Roll Points`
                        } else {
                            txt += `Luck Energy`
                        }
                    }
                    if (upgrade.type === 1) {
                        txt += `Roll Points`
                    }
                }
                return txt
            }
            upgrade.canAfford = () => {
                let resource;
                if (upgrade.type === 0) {
                    if (upgrade.num === 1) {
                        resource = player[upgrade.layer].rollPoints;
                    } else {
                        resource = player[upgrade.layer].energy;
                    }
                }
                if (upgrade.type === 1) {
                    resource = player[upgrade.layer].rollPoints;
                }

                return resource.gte(upgrade.cost());
            }
            upgrade.buy = () => {
                if (upgrade.type === 0) {
                    if (upgrade.num === 1) {
                        player[upgrade.layer].rollPoints = player[upgrade.layer].rollPoints.sub(upgrade.cost());
                    } else {
                        player[upgrade.layer].energy = player[upgrade.layer].energy.sub(upgrade.cost());
                    }
                }
                if (upgrade.type === 1) {
                    player[upgrade.layer].rollPoints = player[upgrade.layer].rollPoints.sub(upgrade.cost());
                }

                addBuyables(upgrade.layer, upgrade.id, 1);
            };
            upgrade.buyMax = () => {
                setBuyableAmount(upgrade.layer, upgrade.id, upgrade.target().add(1).floor().max(player[upgrade.layer].buyables[upgrade.id]))
            }
        }
        return upgrades;
    })(),
    bars: {
        ...(() => {
            const obj = {}
            for (let pet in PET_DATA) {
                obj[pet + 'XP'] = {
                    direction: RIGHT,
                    width: 550,
                    height: 40,
                    progress() {
                        return tmp.l.petLevels[pet].mod(1);
                    },
                    display() {
                        let currXP = player.l.pets[pet];
                        if (tmp.l.petLevels[pet].gte(2)) {
                            currXP = currXP.sub(PET_FORMULAE.level_to_xp(pet, tmp.l.petLevels[pet].floor()));
                        }

                        let nextXP = PET_FORMULAE.level_to_xp(pet, tmp.l.petLevels[pet].floor().add(1))
                        if (tmp.l.petLevels[pet].gte(2)) {
                            nextXP = nextXP.sub(PET_FORMULAE.level_to_xp(pet, tmp.l.petLevels[pet].floor()));
                        }
                        return `${(PET_DATA[pet] ?? { name: "Undefined" }).name} (1/${format(Decimal.div((PET_DATA[pet] ?? { chance: D(Infinity) }).chance, tmp.l.petLuckPow).pow10(), 1)}) | Lv. ${format(tmp.l.petLevels[pet].floor())} - ${format(currXP)} / ${format(nextXP)}`;
                    },
                    fillStyle: {'background-color' : (PET_DATA[pet] ?? { colors: { fill: "#808080" } }).colors.fill},
                    baseStyle: {'background-color' : (PET_DATA[pet] ?? { colors: { base: "#000000" } }).colors.base},
                    textStyle: {'color': (PET_DATA[pet] ?? { colors: { text: "#ffffff" } }).colors.text},
                    unlocked() {
                        return tmp.l.petUnlocked[pet];
                    }
                }
            }
            return obj;
        })()
    },
    clickables: {
        11: {
            title: "Test your luck.",
            display() {
                let txt = ""
                if (player.l.cooldownRand.gt(0)) {
                    txt += `You are on cooldown for ${format(player.l.cooldownRand, 1)}s!<br>`
                }
                txt += `You have rolled ${format(player.l.totalRolls)} times.<br>`
                txt += `Your last roll is ${format(player.l.lastRand, 1)}. (1/${format(player.l.lastRand.root(tmp.l.luckPow[0]).div(tmp.l.luckMult[0]), 1)})<br>`
                txt += `Your best roll is ${format(player.l.maxRand, 1)}. (1/${format(player.l.maxRand.root(tmp.l.luckPow[0]).div(tmp.l.luckMult[0]), 1)})`

                if (player.l.petsGained.length > 0) {
                    txt += `<br>`
                }
                for (let i = 0; i < player.l.petsGained.length; i++) {
                    txt += `<br><span style="color: ${(PET_DATA[player.l.petsGained[i].petType] ?? { colors: { base: "#000000" } }).colors.base}">+${format(player.l.petsGained[i].gain)} ${player.l.petsGained[i].pet}</span>`
                }
                return txt
            },
            canClick() {
                return player.l.cooldownRand.lte(0) && player.l.best.gt(0)
            },
            onClick() {
                if (player.r.safeguards[5]) {
                    return
                }
                player.r.valid[5] = false

                player.l.cooldownRand = D(1)
                player.l.lastRand = tmp.l.rollLol(0)
                player.l.rollPointGen = player.l.rollPointGen.add(tmp.l.rollPointGain)
                player.l.totalRolls = player.l.totalRolls.add(1)

                if (hasUpgrade('l', 13)) {
                    let loss = player.p.buyable5Clicks.max(1e12).mul(0.1)
                    player.p.buyable5Clicks = player.p.buyable5Clicks.sub(loss)
                }

                player.l.petsGained = []
                if (!inChallenge('a', 16)) {
                    for (let pet in PET_DATA) {
                        let petLuck = Math.random()
                        if (tmp.l.petUnlocked[pet] && petLuck < Decimal.div(PET_DATA[pet].chance, tmp.l.petLuckPow).pow10().recip()) {
                            let gain = D(1)
                            gain = gain.mul(tmp.l.buyables[41].effect)
                            gain = gain.mul(tmp.q.buyables[21].effect)
                            if (hasUpgrade('q', 13)) {
                                gain = gain.mul(upgradeEffect('q', 13))
                            }
                            gain = gain.mul(player.l.totalScore2)
                            if (hasUpgrade('l', 43)) {
                                gain = gain.mul(upgradeEffect('l', 43).pet)
                            }
                            if (player.l.petEquipped.includes('dodecahedron')) {
                                gain = gain.mul(tmp.l.petActiveEffs.dodecahedron)
                            }
    
                            // petLuck multiplier 
                            // 0.5 for 0.5 chance = 1, 
                            // 0.25 for 0.5 chance = 2, 
                            // 0.125 for 0.5 chance = 3, 
                            // chance of getting how many
    
                            gain = gain.mul(Decimal.log10(petLuck).neg().div(PET_DATA[pet].chance).mul(tmp.l.petLuckPow).add(1e-7).floor())

                            if (challengeCompletions('a', 16).gte(1)) {
                                gain = gain.pow(tmp.a.challenges[16].rewardEffect.pet)
                            }
                            
                            // console.log(`pet: ${pet} - petLuck: ${format(petLuck, 4)} - base chance: ${format(PET_DATA[pet].chance, 4)} - gain: ${format(Decimal.log(petLuck, PET_DATA[pet].chance).floor(), 2)}`)
                            let currXP = player.l.pets[pet].add(gain);
                            if (tmp.l.petLevels[pet].gte(2)) {
                                currXP = currXP.sub(PET_FORMULAE.level_to_xp(pet, tmp.l.petLevels[pet].floor()));
                            }
                            
                            let nextXP = PET_FORMULAE.level_to_xp(pet, tmp.l.petLevels[pet].floor().add(1))
                            if (tmp.l.petLevels[pet].gte(2)) {
                                nextXP = nextXP.sub(PET_FORMULAE.level_to_xp(pet, tmp.l.petLevels[pet].floor()));
                            }
                            
                            if (currXP.gte(nextXP)) {
                                let lv = PET_FORMULAE.xp_to_level(pet, player.l.pets[pet].add(gain))
                                player.l.petsGained.push({ petType: pet, pet: `${PET_DATA[pet].name}${gain.gt(1) ? 's' : ''}. (Gained ${format(lv.floor().sub(tmp.l.petLevels[pet].floor()))} level${lv.floor().sub(tmp.l.petLevels[pet].floor()).eq(1) ? '' : 's'}!)`, gain: gain })
                            } else {
                                player.l.petsGained.push({ petType: pet, pet: `${PET_DATA[pet].name}${gain.gt(1) ? 's' : ''}. (${format(currXP.div(nextXP).mul(100).mul(10).round().div(10), 1)}%, +${format(gain.div(nextXP).mul(100).mul(10).round().div(10), 1)}%)`, gain: gain })
                            }
    
                            player.l.pets[pet] = Decimal.add(player.l.pets[pet], gain)
                        }
                    }
                }
            },
            style: {
                "min-width": "225px",
                "min-height": "150px",
                "margin": "5px",
            }
        },
        12: {
            title: "Test your luck again.",
            display() {
                let txt = ""
                if (player.l.cooldownRand2.gt(0)) {
                    txt += `You are on cooldown for ${format(player.l.cooldownRand2, 1)}s!<br>`
                }
                txt += `You have rolled ${format(player.l.totalRolls2)} times.<br>`
                txt += `Your last roll is ${format(player.l.lastRand2, 1)}. (1/${format(player.l.lastRand2.root(tmp.l.luckPow[1]).div(tmp.l.luckMult[1]), 1)})<br>`
                txt += `Your best roll is ${format(player.l.maxRand2, 1)}. (1/${format(player.l.maxRand2.root(tmp.l.luckPow[1]).div(tmp.l.luckMult[1]), 1)})<br><br>`
                txt += `Your total score is boosting Luck and Pet gain by &times;${format(player.l.totalScore2, 1)}.`
                return txt
            },
            canClick() {
                return player.l.cooldownRand2.lte(0) && player.l.best.gt(0)
            },
            onClick() {
                if (player.r.safeguards[5]) {
                    return
                }
                player.r.valid[5] = false

                player.l.cooldownRand2 = D(1)
                player.l.lastRand2 = tmp.l.rollLol(1)
                player.l.totalScore2 = player.l.totalScore2.add(player.l.lastRand2)
                player.l.totalRolls2 = player.l.totalRolls2.add(1)
            },
            style: {
                "min-width": "225px",
                "min-height": "150px",
                "margin": "5px",
            },
            unlocked() {
                return hasUpgrade('l', 33)
            }
        },
        ...(() => {
            const obj = {}
            for (let pet in PET_DATA) {
                obj[PET_DATA[pet].number * 10 + 1001] = {
                    title: `Equip ${PET_DATA[pet].name}.`,
                    unlocked() {
                        return tmp.l.petUnlocked[pet];
                    },
                    display() {
                        return `Currently: ${player.l.petEquipped.includes(pet) ? 'Equipped' : 'Unequipped'}`
                    },
                    canClick() {
                        return player.l.petEquipped.includes(pet) || player.l.petEquipped.length < tmp.l.petEquipCap
                    },
                    onClick() {
                        if (player.r.safeguards[4]) {
                            return
                        }
                        if (player.l.petEquipped.includes(pet)) {
                            player.l.petEquipped.splice(player.l.petEquipped.indexOf(pet), 1)
                        } else {
                            player.l.petEquipped.push(pet)
                        }
                    },
                    style() {
                        return {
                            "background-color": player.l.petEquipped.includes(pet) 
                                ? PET_DATA[pet].colors.fill
                                : player.l.petEquipped.length >= tmp.l.petEquipCap
                                    ? PET_DATA[pet].colors.cannotEquip
                                    : PET_DATA[pet].colors.base,
                            "color": player.l.petEquipped.includes(pet)
                                ? PET_DATA[pet].colors.base
                                : PET_DATA[pet].colors.text
                        }
                    }
                }
            }
            return obj
        })()
    },
    tabFormat: {
        // ! NOTE!! IN tabFormat, 'l' DOESN'T WORK !!!
        "Main": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.rollPoints, 2)}</h2> Roll Points. (${format(player.l.rollPointGen, 1)}/s, +${format(tmp.l.rollPointGain, 1)}/roll)` }],
                ["clickables", [1]],
                "blank",
                ["upgrades", [1, 2, 3, 4]],
                ["buyables", [2, 3, 4]]
            ],
            unlocked(){
                return true
            },
        },
        "Dimensions": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.rollPoints, 2)}</h2> Roll Points. (${format(tmp.l.rollPointGain, 1)}/roll)` }],
                ["display-text",
                function() { return `You have <h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.energy)}</h2> Luck Energy, which boosts luck and Roll Points by &times;${format(tmp.l.energyEff.normal, 3)}. (${format(tmp.l.energyPS)}/sec)<br>It also multiplies all prestige dimension multipliers by &times;${format(tmp.l.energyEff.prest, 2)}.` }],
                "blank",
                ["buyables", [1]],
            ],
            unlocked(){
                return hasUpgrade('l', 15)
            },
        },
        "Pets": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You can equip <h2 style="color: #FFFFFF; font-size: 26px; text-shadow: #FFFFFF 0px 0px 10px;">${format(player.l.petEquipped.length)} / ${format(tmp.l.petEquipCap)}</h2> pets.` }],
                "blank",
                // ["display-text",
                // function() { return hasUpgrade('q', 33) ? `You have <h2 style="color: #383; text-shadow: #383 0px 0px 10px;">${format(player.q.waste)}</h2> waste.` : '' }],
                ...(() => {
                    const arr = []
                    for (let pet in PET_DATA) {
                        arr.push(
                            ["row", 
                                [
                                    ["clickables", [PET_DATA[pet].number + 100]], 
                                    ["column", [
                                        ["bar", pet + "XP"],
                                        "blank",
                                        ["display-text",
                                        function() { return tmp.l.petUnlocked[pet]
                                                ? `<span style="color: ${player.l.petEquipped.includes(pet) ? '#dfdfdf' : '#808080'}">(${player.l.petEquipped.includes(pet) ? 'Active' : 'Inactive'}) ${tmp.l.petActiveEffDesc[pet]}</span>`
                                                : '' }],
                                        ["display-text",
                                        function() { return tmp.l.petUnlocked[pet]
                                                ? `(Passive) ${tmp.l.petPassiveEffDesc[pet]}`
                                                : '' }],
                                    ]]
                                ]
                            ]
                        )
                    }
                    return arr
                })()
            ],
            unlocked(){
                return challengeCompletions('p', 12).gte(14)
            },
        },
        "Bonuses": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
/*
            lucky: D(0), // chance: 5%, luck essence gain multiplied by x, m1 and m2 luck raised by log10(x)
            alternative: D(0), // chance: 2%, alt. prestige is raised by x, all alt. dims. are multiplied by x
            goldpet: D(0), // chance: 1%, pet gain is raised log10(x)/10, all equipped pets gain effectiveness over time
                // equipped = +goldpegoldpet time per second, time.div(10).add(1).log2().mul(0.01).mul(goldpet.add(1).log2()).add(1) times effectiveness
            rollBoost: D(0), // chance: 0.5%, M1 and M2's roll count is multiplied by x^2, M1 and M2's cooldown are decreased by /1+log10(x) (max /10)
            replication: D(0) // chance: 0.1%, Pets grow exponentially at x% rate, Roll points grow exponentially at x% rate 
            */
                ["display-text",
                function() { return `Bonuses are gained at random from machines 1 and 2.` }],
                "blank",
                ["display-text",
                function() { return `Lucky Bonus (${format(player.l.totalScore3.mul(0.05).min(1).mul(100), 1)}%) &times;<h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.bonuses.lucky)}</h2>.
                <br>Luck essence gain is multiplied by &times;${format(player.l.bonuses.lucky.add(1))}. M1-2 luck is raised by ^${format(player.l.bonuses.lucky.max(0).add(1).log10().add(1), 3)}.` }],
                "blank",
                ["display-text",
                function() { return `Alternative Bonus (${format(player.l.totalScore3.mul(0.02).min(1).mul(100), 1)}%) &times;<h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.bonuses.alternative)}</h2>.
                <br>Alt. Prestige gain is raised by ^${format(player.l.bonuses.alternative.add(1))}. All Alt. Dimensions are multiplied by &times;${format(player.l.bonuses.alternative)}.` }],
                "blank",
                ["display-text",
                function() { return `Golden Pet Bonus (${format(player.l.totalScore3.mul(0.01).min(1).mul(100), 1)}%) &times;<h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.bonuses.goldpet)}</h2>.
                <br>Pet gain is raised to the ^${format(player.l.bonuses.goldpet.max(0).add(1).log10().div(10).add(1), 3)}. All equipped pets gain effectivenss over time. (&times;${format(player.l.bonuses.goldpet)} time, double time = +${format(player.l.bonuses.goldpet.max(0).add(1).log2())}% effectiveness)` }],
                "blank",
                ["display-text",
                function() { return `Roll Boost Bonus (${format(player.l.totalScore3.mul(0.005).min(1).mul(100), 1)}%) &times;<h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.bonuses.rollBoost)}</h2>.
                <br>M1-2's roll count is multiplied by &times;${format(player.l.bonuses.rollBoost.add(1).pow(2))}, M1-2's cooldown is decreased by /${format(player.l.bonuses.rollBoost.max(0).add(1).log10().add(1), 2)}.` }],
                "blank",
                ["display-text",
                function() { return `Replication Bonus (${format(player.l.totalScore3.mul(0.001).min(1).mul(100), 1)}%) &times;<h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(player.l.bonuses.replication)}</h2>.
                <br>Pets grow exponentially at a ${format(player.l.bonuses.replication)}% rate. Roll Points grow exponentially at a ${format(player.l.bonuses.replication)}% rate.` }],
                "blank",
                ["display-text",
                function() { return `Your total bonuses are giving you <h2 style="color: #FFFF00; font-size: 26px; text-shadow: #FFFF00 0px 0px 10px;">${format(tmp.l.bonusScore)}</h2> bonus score, generating ${format(tmp.l.bonusPtsGain)} bonus points per second.` }],
            ],
            unlocked(){
                return hasUpgrade('l', 46)
            },
        },
    }
})