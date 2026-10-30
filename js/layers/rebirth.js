"use strict";

addLayer('r', {
    name: "rebirths", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'R', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 2, // Row the layer is in on the tree (0 is the first row)
	branches: ['l', 'q'],
    hotkeys: [
        {key: 'r', description: "R: Reset for rebirths", onPress(){if (canReset('r')) doReset('r')}},
    ],
    layerShown(){ return challengeCompletions('q', 14).gte(1) || Decimal.gt(player.r.best, 0) },
    startData() { return {
        unlocked: false,
        points: D(0),
        bestPointsInR: D(0),
        timeInR: D(0),
        chalPB: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
        safeguards: [false, false, false, false, false, false, false, false, false, false, false],
        valid: [true, true, true, true, true, true, true, true, true, true, true]

    }},
    color: "#40ff40",
    requires: D('e1.797693e308'), // Can be a function that takes requirement increases into account
    resource: "rebirths", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player.r.timeInR = player.r.timeInR.add(player.globalTS.mul(diff))

        for (let i = 0; i < player.r.chalPB.length; i++) {
            if (player.r.valid[i] && ((tmp.r.challenges[11 + i] ?? { unlocked: false }).unlocked)) {
                player.r.chalPB[i] = Decimal.max(player.r.chalPB[i], player.points)
                player.r.challenges[11 + i] = Decimal.max(player.r.challenges[11 + i], tmp.r.challenges[11 + i].target.ceil())
            }
        }
    },
    getRequire() {
        let i = new Decimal('e1.797693e308')
        return i
    },
    canReset() {
        return tmp.r.getResetGain.gte(1)
    },
    getResetGain() {
        let i = player.points.lt('e1.797693e308') 
            ? D(0) 
            : player.points.log10().log(2).div(1024).log(2).mul(8)
        if (i.gte(2)) {
            i = i.log(2).add(1)
        }

        i = i.sub(player.r.total)
        i = i.floor().max(0)
        return i
    },
    getNextAt() {
        let i = tmp.r.getResetGain
        i = i.add(player.r.total)
        i = i.add(1)

        if (i.gte(2)) {
            i = i.sub(1).pow_base(2)
        }

        i = i.div(8).pow_base(2).mul(1024).pow_base(2).pow10()
        return i
    },
    prestigeButtonText(){
        let gain = tmp.r.getResetGain
        let nextAt = tmp.r.getNextAt

        let amt = "You can reset for " + format(gain) + " Rebirths"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    doReset() {
        // r
        player.r.timeInR = D(0)
        for (let i = 0; i < player.r.valid.length; i++) {
            player.r.valid[i] = true
        }

        // l
        if (hasMilestone('r', 3)) {
            player.l.points = D(10)
            player.l.best = D(10)
            player.l.total = D(10)
        } else {
            player.l.points = D(0)
            player.l.best = D(0)
            player.l.total = D(0)
        }
        let SAFE_UPGRADES = []
        if (hasMilestone('r', 5)) {
            if (player.r.points.gte(6)) {
                SAFE_UPGRADES.push(11, 12, 13, 14, 15)
            }
            if (player.r.points.gte(7)) {
                SAFE_UPGRADES.push(21, 22, 23, 24, 25)
            }
            if (player.r.points.gte(8)) {
                SAFE_UPGRADES.push(16, 26, 31, 32, 33)
            }
            if (player.r.points.gte(9)) {
                SAFE_UPGRADES.push(34, 35, 36, 41, 42)
            }
            if (player.r.points.gte(10)) {
                SAFE_UPGRADES.push(43, 44, 45, 46)
            }
        }
        player.l.upgrades = player.l.upgrades.filter((upg) => { return SAFE_UPGRADES.includes(upg) })
        player.l.bestPointsInL = D(0)
        player.l.timeInL = D(0)

        player.l.totalRolls = D(0)
        player.l.cooldownRand = D(1)
        player.l.lastRand = D(1)
        player.l.maxRand = D(1)

        player.l.totalRolls2 = D(0)
        player.l.cooldownRand2 = D(1)
        player.l.lastRand2 = D(1)
        player.l.maxRand2 = D(1)
        player.l.totalScore2 = D(1)

        player.l.totalRolls3 = D(0)
        player.l.cooldownRand3 = D(1)
        player.l.lastRand3 = D(1)
        player.l.maxRand3 = D(1)
        player.l.totalScore3 = D(1)

        player.l.rollPoints = D(0)
        player.l.rollPointGen = D(0)
        player.l.energy = D(0)
        player.l.totalEnergy = D(0)
        for (let i = 0; i < player.l.dimensionAccu.length; i++) {
            player.l.dimensionAccu[i] = D(0)
        }

        for (let i in player.l.pets) {
            player.l.pets[i] = D(0)
        }
        player.l.petEquipped = []
        player.l.timeDodecahedronEquipped = D(0)

        setBuyableAmount('l', 11, D(0))
        setBuyableAmount('l', 12, D(0))
        setBuyableAmount('l', 13, D(0))
        setBuyableAmount('l', 14, D(0))
        setBuyableAmount('l', 15, D(0))
        setBuyableAmount('l', 16, D(0))
        setBuyableAmount('l', 17, D(0))
        setBuyableAmount('l', 18, D(0))
        setBuyableAmount('l', 21, D(0))
        setBuyableAmount('l', 22, D(0))
        setBuyableAmount('l', 23, D(0))
        setBuyableAmount('l', 31, D(0))
        setBuyableAmount('l', 32, D(0))
        setBuyableAmount('l', 33, D(0))
        setBuyableAmount('l', 41, D(0))
        setBuyableAmount('l', 42, D(0))
        setBuyableAmount('l', 43, D(0))

        // q
        player.q.points = D(0)
        player.q.bestPointsInQ = D(0)
        player.q.total = D(0)
        player.q.best = D(0)
        player.q.timeInQ = D(0)
        for (let i = 0; i < player.q.allocated.length; i++) {
            player.q.allocated[i] = D(0)
            player.q.allocGen[i] = D(0)
        }

        setBuyableAmount('q', 11, D(0))
        setBuyableAmount('q', 12, D(0))
        setBuyableAmount('q', 13, D(0))
        setBuyableAmount('q', 21, D(0))
        setBuyableAmount('q', 22, D(0))
        setBuyableAmount('q', 23, D(0))

        SAFE_UPGRADES = []
        if (hasMilestone('r', 5)) {
            if (player.r.points.gte(6)) {
                SAFE_UPGRADES.push(11, 12, 13, 14, 15)
            }
            if (player.r.points.gte(7)) {
                SAFE_UPGRADES.push(16, 17, 21, 22, 23)
            }
            if (player.r.points.gte(8)) {
                SAFE_UPGRADES.push(24, 25, 26, 27, 31)
            }
            if (player.r.points.gte(9)) {
                SAFE_UPGRADES.push(32, 33, 34, 35, 36)
            }
            if (player.r.points.gte(10)) {
                SAFE_UPGRADES.push(37, 41, 42, 43, 44)
            }
            if (player.r.points.gte(11)) {
                SAFE_UPGRADES.push(45, 46, 47)
            }
        }
        player.q.upgrades = player.q.upgrades.filter((upg) => { return SAFE_UPGRADES.includes(upg) })

        const SAFE_MILESTONES = []
        if (hasMilestone('r', 3)) {
            SAFE_MILESTONES.push(8)
        }
        player.q.milestones = player.q.milestones.filter((mil) => { return SAFE_MILESTONES.includes(parseInt(mil)) })
        
        if (!hasMilestone('r', 2)) {
            player.q.challenges[11] = D(0)
            player.q.challenges[12] = D(0)
            player.q.challenges[13] = D(0)
            player.q.challenges[14] = D(0)
        }

        // via r milestone 0
        setBuyableAmount('p', 16, D(0))
        setBuyableAmount('p', 17, D(0))
        // special case
        player.p.buyable5Clicks = D(0)
        if (hasMilestone('r', 5)) {
            player.p.challenges[14] = player.p.challenges[14].max(0).add(1).log10().add(1).pow(0.25).sub(1).pow10().sub(1).floor()
        }

        tmp.q.doReset(false)
    },
    milestones: {
        0: {
            requirementDescription: "1 rebirth",
            effectDescription: "Unlock several new prestige upgrades and luck upgrades. Unlock Point Buyable 6.",
            done() { return player.r.total.gte(1) }
        },
        1: {
            requirementDescription: "2 rebirths",
            effectDescription: "Keep all Tree Prestige Challenges.",
            done() { return player.r.total.gte(2) },
            unlocked() { return hasMilestone('r', 0) }
        },
        2: {
            requirementDescription: "3 rebirths",
            effectDescription: "Unlock more Rank/Tier milestones and unlock Tetrs. Keep all Quaternion Challenges.",
            done() { return player.r.total.gte(3) },
            unlocked() { return hasMilestone('r', 1) }
        },
        3: {
            requirementDescription: "4 rebirths",
            effectDescription: "Unlock 2 new pets and 1 more pet slot. Start with 10 luck essence. Keep all Prestige Upgrades.",
            done() { return player.r.total.gte(4) },
            unlocked() { return hasMilestone('r', 2) }
        },
        4: {
            requirementDescription: "5 rebirths",
            effectDescription: "Hexagon no longer disables automation and Pentagon's slowdown no longer occurs. Unlock a new row of quaternion and luck upgrades.",
            done() { return player.r.total.gte(5) },
            unlocked() { return hasMilestone('r', 3) }
        },
        5: {
            requirementDescription: "6 rebirths",
            effectDescription() { return `Keep 5 quaternion and luck upgrades per rebirth past 5 rebirths in chronological order. Keep PC1, up to 10 of PC2, and up to ^0.25 to th exponent of PC4.<br>Currently: ${format(player.r.points.sub(5).max(0).mul(5))} upgrades kept.` },
            done() { return player.r.total.gte(6) },
            unlocked() { return hasMilestone('r', 4) }
        },
        6: {
            requirementDescription: "7 rebirths",
            effectDescription() { return `Unlock a new layer and 2 more rebirth challenges.` },
            done() { return player.r.total.gte(7) },
            unlocked() { return hasMilestone('r', 5) }
        },
        7: {
            requirementDescription: "8 rebirths",
            effectDescription() { return `Automate Tetrs and they don't reset. Autobuy Quaternion Buyables 4-6.` },
            done() { return player.r.total.gte(8) },
            unlocked() { return hasMilestone('r', 6) }
        },
        8: {
            requirementDescription: "9 rebirths",
            effectDescription() { return `PC2 is fully kept. PB7 and AB2-6 are automated. Machine 2 is auto-rolled.` },
            done() { return player.r.total.gte(9) },
            unlocked() { return hasMilestone('r', 7) }
        },
    },
    clickables: {
        11: {
            title: "Force Rebirth",
            display() {
                return 'This will not give you anything.'
            },
            canClick() {
                return true
            },
            onClick() {
                if (confirm("Are you sure you want to do a rebirth reset? You will not gain anything by doing this!")) {
                    PAUSE_EVERYTHING = 20
                    tmp.r.doReset()
                }
            },
            unlocked() {
                return hasMilestone('r', 0)
            }
        }
    },
    challenges: {
        ...(() => {
            const obj = {}
            for (let i = 0; i < 11; i++) {
                if (i === 9) {
                    i++
                }
                obj[11 + i] = {
                    name() { 
                        return `${[
                            'Basic Challenge',
                            'No Point Buyable 4',
                            'No Balls',
                            'No Rank',
                            'No Pets',
                            'No Luck',
                            'No QBs',
                            'No Quaternions',
                            'No Prestige',
                            'error: how',
                            'I said, NO PRESTIGE (nor point buyables for that matter).'
                        ][i]} (${format(challengeCompletions('r', 11 + i))})`
                    },
                    challengeDescription() {
                        let txt
                        switch (i) {
                            case 0:
                                txt = 'Nothing. You are always in this challenge.'
                                break;
                            case 1:
                                txt = 'You may not buy Point Buyable 4.'
                                break;
                            case 2:
                                txt = 'You may not buy any prestige buyables.'
                                break;
                            case 3:
                                txt = 'You may not Rank Up.'
                                break;
                            case 4:
                                txt = 'You may not equip Pets.'
                                break;
                            case 5:
                                txt = 'You may not roll or gain luck essence.'
                                break;
                            case 6:
                                txt = 'You may not buy any quaternion buyables.'
                                break;
                            case 7:
                                txt = 'You may not gain any quaternions.'
                                break;
                            case 8:
                                txt = 'You may not gain any prestige points.'
                                break;
                            case 9:
                                txt = 'error: how'
                                break;
                            case 10:
                                txt = 'You may not buy any buyable from the Prestige layer.'
                                break;
                            default: 
                                throw new Error(`${i} is not a valid Rebirth challenge index`)
                        }

                        let notices = []
                        if (player.r.valid[i]) {
                            notices.push('<span style="color: #306030"><b>Valid</b></span>')
                        } else {
                            notices.push('<span style="color: #a02020"><b>Invalid</b></span>')
                        }
                        if (player.r.safeguards[i]) {
                            notices.push('<span style="color: #304860"><b>Safeguarded</b></span>')
                        }

                        if (notices.length > 0) {
                            txt += `<br><b>`
                            for (let j = 0; j < notices.length - 1; j++) {
                                txt += `${notices[j]}, `
                            }
                            txt += notices[notices.length - 1]
                            txt += `</b>`
                        }
                        return txt
                    },
                    rewardEffect() {
                        let eff = challengeCompletions('r', 11 + i)
                        switch (i) {
                            case 0:
                                eff = {
                                    next: player.points.max(1).log10().add(1).log10().div(25).add(1).pow(0.5).pow(eff.add(1))
                                    ,
                                    curr: player.points.max(1).log10().add(1).log10().div(25).add(1).pow(0.5).pow(eff)
                                }
                                break;
                            case 1:
                                eff = {
                                    next: eff.add(1).mul(0.05).add(1)
                                    ,
                                    curr: eff.mul(0.05).add(1)
                                }
                                break;
                            case 2:
                                eff = {
                                    next: eff.add(1).mul(0.025).add(1)
                                    ,
                                    curr: eff.mul(0.025).add(1)
                                }
                                break;
                            case 3:
                                eff = {
                                    next: eff.add(1).mul(0.02).add(1)
                                    ,
                                    curr: eff.mul(0.02).add(1)
                                }
                                break;
                            case 4:
                                eff = {
                                    next: eff.add(1).mul(0.01).add(1)
                                    ,
                                    curr: eff.mul(0.01).add(1)
                                }
                                break;
                            case 5:
                                eff = {
                                    next: (eff.add(1)).gte(7)
                                        ? (eff.add(1)).add(17)
                                        : (eff.add(1)).gte(3)
                                            ? (eff.add(1)).sub(1).mul(4)
                                            : (eff.add(1)).pow_base(2)
                                    ,
                                    curr: (eff).gte(7)
                                        ? (eff).add(17)
                                        : (eff).gte(3)
                                            ? (eff).sub(1).mul(4)
                                            : (eff).pow_base(2)
                                }
                                break;
                            case 6:
                                eff = {
                                    next: eff.add(1).mul(0.01).add(1)
                                    ,
                                    curr: eff.mul(0.01).add(1)
                                }
                                break;
                            case 7:
                                eff = {
                                    next: player.p.points.max(10).log10().log10().add(1).pow(0.8).sub(1).pow10().pow(eff.add(1))
                                    ,
                                    curr: player.p.points.max(10).log10().log10().add(1).pow(0.8).sub(1).pow10().pow(eff)
                                }
                                break;
                            case 8:
                                eff = {
                                    next: eff.add(1).pow(5).pow_base(1e10)
                                    ,
                                    curr: eff.pow(5).pow_base(1e10)
                                }
                                break;
                            case 9:
                                eff = {
                                    next: D(1)
                                    ,
                                    curr: D(1)
                                }
                                break;
                            case 10:
                                eff = {
                                    next: eff.add(1).pow(4).pow_base(1e100)
                                    ,
                                    curr: eff.pow(4).pow_base(1e100)
                                }
                                break;
                            default: 
                                throw new Error(`${i} is not a valid Rebirth challenge index`)
                        }
                        return eff
                    },
                    rewardDisplay() { 
                        let txt
                        switch (i) {
                            case 0:
                                txt = `Points raises itself by ^${format(this.rewardEffect().curr, 2)} (Next: ^${format(this.rewardEffect().next, 2)})` 
                                break;
                            case 1:
                                txt = `Point Buyable 4 is +${format(this.rewardEffect().curr.sub(1).mul(100))}% more effective. (Next: +${format(this.rewardEffect().next.sub(1).mul(100))}%)`
                                break;
                            case 2:
                                txt = `PP Buyables are +${format(this.rewardEffect().curr.sub(1).mul(100), 1)}% more effective. (Next: +${format(this.rewardEffect().next.sub(1).mul(100), 1)}%)`
                                break;
                            case 3:
                                txt = `Ranks scale ${formatPerc(this.rewardEffect().curr, 1)} slower. (Next: ${formatPerc(this.rewardEffect().next, 1)})`
                                break;
                            case 4:
                                txt = `Pets level up ${format(this.rewardEffect().curr, 2)}&times; faster. (Next: ${format(this.rewardEffect().next, 2)}&times;)`
                                break;
                            case 5:
                                txt = `Luck and Pet Luck are raised ^${format(this.rewardEffect().curr, 2)}. (Next: ^${format(this.rewardEffect().next, 2)})`
                                break;
                            case 6:
                                txt = `Quaternion Buyables are +${format(this.rewardEffect().curr.sub(1).mul(100), 1)}% more effective. (Next: +${format(this.rewardEffect().next.sub(1).mul(100), 1)}%)`
                                break;
                            case 7:
                                txt = `Prestige Points raise points by ^${format(this.rewardEffect().curr, 2)} (Next: ^${format(this.rewardEffect().next, 2)})  and Quaternions are gained based off points on a severely decreased rate.`
                                break;
                            case 8:
                                txt = `Prestige Points are boosted by ^${format(this.rewardEffect().curr, 2)} (Next: ^${format(this.rewardEffect().next, 2)})` 
                                break;
                            case 9:
                                txt = `error: how` 
                                break;
                            case 10:
                                txt = `Points are boosted by ^${format(this.rewardEffect().curr, 2)} (Next: ^${format(this.rewardEffect().next, 2)})` 
                                break;
                            default: 
                                throw new Error(`${i} is not a valid Rebirth challenge index`)
                        }
                        return txt
                    },
                    goal() {
                        let goal = challengeCompletions('r', 11 + i)
                        if (goal.gte(32)) {
                            goal = goal.div(32).pow_base(2).sub(1).mul(32)
                        }

                        goal = goal.div(2)
                        if (i >= 4) {
                            goal = goal.add(4).add(Decimal.sub(i, 4).mul(2).add(4))
                            if (i === 5) {
                                goal = goal.sub(4)
                            }
                            if (i >= 6) {
                                goal = goal.mul(2)
                            }
                            if (i === 8) {
                                goal = goal.sub(24)
                            }
                            if (i === 10) {
                                goal = goal.sub(20)
                            }
                        } else {
                            goal = goal.add(i)
                        }
                        goal = goal.div(2).pow_base(2).mul(10).pow10().pow10()
                        return goal
                    },
                    target() {
                        let target = player.points
                        target = target.max('ee10').log10().log10().div(10).log(2).mul(2)
                        if (i >= 4) {
                            if (i === 10) {
                                target = target.add(20)
                            }
                            if (i === 8) {
                                target = target.add(24)
                            }
                            if (i >= 6) {
                                target = target.div(2)
                            }
                            if (i === 5) {
                                target = target.add(4)
                            }
                            target = target.sub(Decimal.sub(i, 4).mul(2).add(4)).sub(4)
                        } else {
                            target = target.sub(i)
                        }
                        target = target.mul(2)

                        if (target.gte(32)) {
                            target = target.div(32).add(1).log2().mul(32)
                        }
                        return target
                    },
                    goalDescription() {
                        return `Get ${format(tmp.r.challenges[11 + i].goal)} Points.`
                    },
                    canEnter() {
                        return true
                    },
                    overrideOnEnter: true,
                    onEnter() {
                        player.r.safeguards[i] = !player.r.safeguards[i]
                        if (player.r.activeChallenge === 11 + i) {
                            player.r.activeChallenge = null
                        }
                        return
                    },
                    completionLimit() {
                        return D(Infinity)
                    },
                    unlocked() {
                        if (i === 10) {
                            return upgradeEffect('a', 34).gte(2)
                        }
                        if (i === 8) {
                            return upgradeEffect('a', 34).gte(1)
                        }
                        if (i >= 6) {
                            if (!hasMilestone('r', 6)) {
                                return false
                            }
                        }
                        return true
                    }
                }
            }
            return obj;
        })(),
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["milestones", [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]]
            ],
            unlocked(){
                return true
            },
        },
        "Challenges": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You cannot enter any challenges, you are automatically placed in them until you violate their conditions. The buttons here determine if you have safeguards on.` }],
                ["display-text",
                function() { return `Safeguards prevent you from violating the challenge's conditions, but they do not revalidate a challenge, meaning that for it to be useful, you must do a rebirth reset.` }],
                "blank",
                ["display-text",
                function() { return `After 32 completions, their requirement will start to scale faster.` }],
                "blank",
                ["clickables", [1]],
                ["challenges", [1, 2]]
            ],
            unlocked(){
                return player.r.total.gte(1) || true
            },
        },
    }
})