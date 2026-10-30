"use strict";

addLayer('a', {
    name: "rebirths", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: 'A', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 2, // Row the layer is in on the tree (0 is the first row)
	branches: ['r'],
    hotkeys: [
        {key: 'a', description: "A: Reset for alternate prestige", onPress(){if (canReset('a')) doReset('a')}},
    ],
    layerShown(){ return hasMilestone('r', 6) },
    startData() { return {
        unlocked: true,
        points: D(0),
        timeInA: D(0),
        subpoints: D(0),
        bestSubpoints: D(0),
        energy: D(0),
        totalEnergy: D(0),
        dimensionAccu: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)]
    }},
    color: "#ff4040",
    requires: D(0), // Can be a function that takes requirement increases into account
    resource: "alternate prestige", // Name of prestige currency
    baseResource: "alt. points", // Name of resource prestige is based on
    baseAmount() { return player.a.subpoints }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player.a.timeInA = player.a.timeInA.add(player.globalTS.mul(diff))

        if (hasUpgrade('a', 21)) {
            player.a.subpoints = Decimal.mul(player.a.subpoints.max(1), tmp.a.subpointGain.max(10).log10().mul(player.globalTS.mul(diff)).pow10())
        } else {
            player.a.subpoints = Decimal.add(player.a.subpoints, tmp.a.subpointGain.mul(player.globalTS.mul(diff)))
        }
        player.a.bestSubpoints = Decimal.max(player.a.bestSubpoints, player.a.subpoints)

        if (hasUpgrade('a', 23)) {
            let gen = tmp.a.getResetGain

            player.a.points = player.a.points.add(gen.mul(diff).mul(player.globalTS))
            player.a.total = player.a.total.add(gen.mul(diff).mul(player.globalTS))
            player.a.best = player.a.best.max(player.a.points)
        }

        player.a.energy = player.a.energy.add(tmp.a.energyGain.mul(diff))
        player.a.totalEnergy = player.a.totalEnergy.add(tmp.a.energyGain.mul(diff))

        // goes backwards because higher dims need to be prioritized
        // ends at 1 because i-1 at 0 crashes (-1 index)
        for (let i = 7; i >= 1; i--) {
            player.a.dimensionAccu[i-1] = player.a.dimensionAccu[i-1].add(
                player.a.dimensionAccu[i].add(player.a.buyables[21 + i]).mul(tmp.a.buyables[21 + i].effect)
                .mul(diff).mul(player.globalTS)
            )
        }

        if (hasUpgrade('a', 22)) {
            tmp.a.buyables[11].buyMax()
        }
        
        if (hasMilestone('r', 8)) {
            tmp.a.buyables[12].buyMax()
            tmp.a.buyables[13].buyMax()
            tmp.a.buyables[14].buyMax()
            tmp.a.buyables[15].buyMax()
            tmp.a.buyables[16].buyMax()
        }
    },
    effect() {
        return player.a.points.max(0).add(1).ln().div(20).add(1).ln().mul(2.25).add(1)
    },
    effectDescription(){
        return ` raising alt. points by ^${format(tmp.a.effect, 3)} and alt. challenge reqs. by ^${format(tmp.a.effect.ln().add(1).recip(), 4)}.`
    },
    subpointGain() {
        if (!hasMilestone('r', 6)) {
            return D(0)
        }
        let gain = D(1)
        gain = gain.mul(tmp.a.buyables[11].effect)
        if (hasUpgrade('a', 11)) {
            gain = gain.mul(upgradeEffect('a', 11))
        }

        gain = gain.pow(tmp.a.effect)
        if (challengeCompletions('a', 14).gte(1)) {
            gain = gain.pow(tmp.a.challenges[14].rewardEffect)
        }
        if (challengeCompletions('a', 16).gte(1)) {
            gain = gain.max(0).add(1).log10().pow(tmp.a.challenges[16].rewardEffect.pet).pow10().sub(1)
        }

        if (inChallenge('a', 11)) {
            gain = gain.max(0).add(1).log10().add(1).pow(Decimal.pow(0.9, tmp.a.challenges[11].getDepths)).sub(1).pow10().sub(1);
        }
        return gain
    },
    subpointEffect() {
        // return D(1)

        let eff = player.a.bestSubpoints.max(0).add(1).log10().div(10).add(1).pow(2)
        return eff
    },
    energyGain() {
        return player.a.dimensionAccu[0].add(player.a.buyables[21]).mul(tmp.a.buyables[21].effect).mul(player.globalTS)
    },
    energyEffect() {
        return player.a.totalEnergy.max(0).add(1).log10().div(100).add(1)
    },
    getRequire() {
        let i = new Decimal(1e33)
        return i
    },
    canReset() {
        return tmp.a.getResetGain.gte(1)
    },
    getResetGain() {
        let i = player.a.subpoints.lt(1e33) 
            ? D(0) 
            : player.a.subpoints.log10().div(3.3).log10().pow(2.5).sub(1).pow10()

        i = i.floor().max(0)
        return i
    },
    getNextAt() {
        let i = tmp.a.getResetGain

        i = i.add(1).log10().add(1).root(2.5).pow10().mul(3.3).pow10()
        return i
    },
    prestigeButtonText(){
        let gain = tmp.a.getResetGain
        let nextAt = tmp.a.getNextAt

        let amt = "You can reset for " + format(gain) + " Alt. Prestige"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    doReset() {
        player.a.subpoints = D(0)

        player.a.timeInA = D(0)

        setBuyableAmount('a', 11, D(0))
        setBuyableAmount('a', 12, D(0))
        setBuyableAmount('a', 13, D(0))

        const UNSAFE_UPGRADES = []
        
        player.a.upgrades = player.a.upgrades.filter((value) => { return !UNSAFE_UPGRADES.includes(value) });
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #f44; text-shadow: #f44 0px 0px 10px;">${format(player.a.subpoints)}</h2> alt. points, boosting point gain by ^${format(tmp.a.subpointEffect, 3)}. (${format(tmp.a.subpointGain, 1)}/s)` }],
                "blank",
                ["buyables", [1]],
                "blank",
                ["upgrades", [1, 2, 3]]
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
                function() { return `You have <h2 style="color: #f44; text-shadow: #f44 0px 0px 10px;">${format(player.a.subpoints)}</h2> alt. points, boosting point gain by ^${format(tmp.a.subpointEffect, 3)}. (${format(tmp.a.subpointGain, 1)}/s)` }],
                "blank",
                ["challenges", [1]]
            ],
            unlocked(){
                return player.a.total.gte(1)
            },
        },
        "Dimensions": {
            content: [
                "main-display",
                ["prestige-button", ""],
                "blank",
                ["display-text",
                function() { return `You have <h2 style="color: #f44; text-shadow: #f44 0px 0px 10px;">${format(player.a.subpoints)}</h2> alt. points, boosting point gain by ^${format(tmp.a.subpointEffect, 3)}. (${format(tmp.a.subpointGain, 1)}/s)` }],
                ["display-text",
                function() { return `You have <h2 style="color: #f44; text-shadow: #f44 0px 0px 10px;">${format(player.a.energy)}</h2> energy, decreasing Alt. Buyable 1-4's cost scaling by -${formatPerc(tmp.a.energyEffect, 3)}. (${format(tmp.a.energyGain, 1)}/s)` }],
                ["display-text",
                function() { return `<span style="font-size: 8px">This is getting overused, I know it.<span>` }],
                "blank",
                ["buyables", [2]]
            ],
            unlocked(){
                return hasUpgrade('a', 25)
            },
        },
    },
    upgrades: {
        11: {
            title: "Pure Power",
            description: "Alt. Points are boosted by points.",
            cost: new Decimal(1e3),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                let ret = Decimal.max(player.points, 10).log10().log10().max(10000).log(10000).pow(10)
                let stacks = D(1)
                if (hasUpgrade('a', 15)) {
                    stacks = stacks.add(upgradeEffect('a', 15).sub(1))
                }
                if (hasUpgrade('a', 31)) {
                    stacks = stacks.add(upgradeEffect('a', 31).sub(1))
                }
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 1)}` },
        },
        12: {
            title: "Don't say it.",
            description: "Unlock Alt. Buyable 3.",
            cost: Decimal.pow10(6.7),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            }
        },
        13: {
            title: "Slash!",
            description: "Decrease Alt. Buyable 1's cost.",
            cost: new Decimal(1e8),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                let ret = D(0.5)
                let stacks = D(1)
                if (hasUpgrade('a', 15)) {
                    stacks = stacks.add(upgradeEffect('a', 15).sub(1))
                }
                if (hasUpgrade('a', 31)) {
                    stacks = stacks.add(upgradeEffect('a', 31).sub(1))
                }
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `^${format(this.effect(), 2)}` },
        },
        14: {
            title: "Unreal",
            description: "Increase the effect base of AB2 and AB3.",
            cost: new Decimal(1e10),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                let ret = D(0.02)
                let stacks = D(1)
                if (hasUpgrade('a', 15)) {
                    stacks = stacks.add(upgradeEffect('a', 15).sub(1))
                }
                if (hasUpgrade('a', 31)) {
                    stacks = stacks.add(upgradeEffect('a', 31).sub(1))
                }
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.mul(stacks)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 2)}` },
        },
        15: {
            title: "Make up BS Names",
            description: "For every upgrade ahead of this one, apply half of all prior upgrades (if applicable).",
            cost: new Decimal(1e12),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                // add 1 if the upg is id >15
                let ret = player.a.upgrades.reduce((total, upg) => { return total + (upg >= 15 ? 1 : 0); }, 0)
                ret = Decimal.mul(ret, 0.5).add(1)
                let stacks = D(1)
                if (hasUpgrade('a', 31)) {
                    stacks = stacks.add(upgradeEffect('a', 31).sub(1))
                }
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 1)}` },
        },
        21: {
            title: "Terrible Destruction",
            description: "Alt. Point generation increases exponentially.",
            cost: new Decimal('e6000'),
            unlocked() { return challengeCompletions('a', 12).gte(1) },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
        },
        22: {
            title: "Idiocy",
            description: "AB1 is autobought.",
            cost: new Decimal('e6400000'),
            unlocked() { return challengeCompletions('a', 12).gte(1) },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
        },
        23: {
            title: "Stupidity",
            description: "Alt. Prestige gain is autogenerated at a 100% rate.",
            cost: new Decimal('e160000000'),
            unlocked() { return challengeCompletions('a', 12).gte(1) },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
        },
        24: {
            title: "Dumbahh",
            description: "Alt. Buyables #1-3's costs scale slightly slower based on your Alt. Points.",
            cost: new Decimal('e4.8e9'),
            unlocked() { return challengeCompletions('a', 12).gte(1) },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                let ret = player.a.subpoints.max(1e10).log10().log10().log10().div(100).add(1).pow(10)
                let stacks = D(1)
                if (hasUpgrade('a', 31)) {
                    stacks = stacks.add(upgradeEffect('a', 31).sub(1))
                }
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 2)}` },
        },
        25: {
            title: "Overused Garbage",
            description: "Unlock 4 more Alt. Challenges and unlock Alt. Dimensions.",
            cost: new Decimal('ee12'),
            unlocked() { return challengeCompletions('a', 12).gte(1) },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
        },
        31: {
            title: "Upgrade Stacking^2",
            description: "For every upgrade ahead of this one, apply a tenth of all prior upgrades (if applicable).",
            cost: new Decimal('e2e19'),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                // add 1 if the upg is id >31
                let ret = player.a.upgrades.reduce((total, upg) => { return total + (upg >= 31 ? 1 : 0); }, 0)
                ret = Decimal.mul(ret, 0.1).add(1)
                let stacks = D(1)
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `&times;${format(this.effect(), 1)}` },
        },
        32: {
            title: "Upgrade Stacking^3",
            description: "For every upgrade ahead of this one, Alt. Buyable 4's cost scales -5% slower.",
            cost: new Decimal('e4e25'),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                // add 1 if the upg is id >32
                let ret = player.a.upgrades.reduce((total, upg) => { return total + (upg >= 32 ? 1 : 0); }, 0)
                ret = Decimal.pow(1.05, ret)
                let stacks = D(1)
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `-${formatPerc(this.effect(), 1)}` },
        },
        33: {
            title: "Upgrade Stacking^4",
            description: "For every upgrade ahead of this one, Unlock a new Alt. Buyable.",
            cost: new Decimal('e7e36'),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                // add 1 if the upg is id >33
                let ret = player.a.upgrades.reduce((total, upg) => { return total + (upg >= 33 ? 1 : 0); }, 0)
                ret = Decimal.mul(1, ret)
                let stacks = D(1)

                ret = ret.mul(stacks).min(3)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect())}` },
        },
        34: {
            title: "Upgrade Stacking^5",
            description: "For every upgrade ahead of this one, Unlock a new Rebirth Challenge.",
            cost: new Decimal('e6e52'),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                // add 1 if the upg is id >34
                let ret = player.a.upgrades.reduce((total, upg) => { return total + (upg >= 34 ? 1 : 0); }, 0)
                ret = Decimal.mul(1, ret)
                let stacks = D(1)
                if (hasUpgrade('a', 35)) {
                    stacks = stacks.add(upgradeEffect('a', 35))
                }

                ret = ret.mul(stacks).min(2)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect())}` },
        },
        35: {
            title: "Upgrade Stacking^ω",
            description: "[unimp.] For every log2(Alt. Buyable 4 bought) past 4, add 0.1 free upgrades to all upgrades before Upgrade Stacking^4.",
            cost: new Decimal('ee100'),
            unlocked() { return true },
            currencyInternalName: 'subpoints',
            currencyDisplayName: 'Alt. Points',
            currencyLocation() {
                return player.a
            },
            effect() { 
                let ret = Decimal.max(player.a.buyables[14], 1).log2().sub(4).max(0).mul(0.1)
                let stacks = D(1)

                ret = ret.pow(stacks)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}` },
        },
    },
    buyables: (() => {
        const upgrades = {
            11: {
                type: 0,
                num: 1,
                get costD() {
                    const obj = {type: 0, exp: 0, main: [D(4), D(1.25), D(1.001)]}

                    return obj
                },
                unlocked() { return true },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    j = D(1)

                    if (challengeCompletions('a', 15).gte(1)) {
                        i = i.pow(2)
                    }

                    if (i.gte(25)) {
                        i = i.div(25).sub(1).exp().mul(25)
                    }
                    i = Decimal.mul(j, i)
                    i = i.add(1)

                    if (inChallenge('a', 13)) {
                        i = i.mul(tmp.a.buyables[12].effect)
                    } else {
                        i = i.pow(tmp.a.buyables[12].effect)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.a.buyables[11])
                    return `&times;${format(currEffect, 1)} alt. point gain.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.a.buyables[11])
                    const nextEffect = this.effect(player.a.buyables[11].add(1))
                    return `+&times;${format(nextEffect.sub(currEffect), 1)} alt. point gain.` 
                },
                scaleModifEffective(x) {
                    if (x.gte(25)) {
                        x = x.div(25).sub(1).exp().mul(25)
                    }
                    if (hasUpgrade('a', 24)) {
                        x = x.div(upgradeEffect('a', 24))
                    }
                    x = x.div(tmp.a.energyEffect)
                    return x
                },
                scaleModifCost(x) {
                    if (hasUpgrade('a', 13)) {
                        x = x.pow(upgradeEffect('a', 13))
                    }
                    return x
                },
                scaleModifTarEff(x) {
                    x = x.mul(tmp.a.energyEffect)
                    if (hasUpgrade('a', 24)) {
                        x = x.mul(upgradeEffect('a', 24))
                    }
                    if (x.gte(25)) {
                        x = x.div(25).ln().add(1).mul(25)
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    if (hasUpgrade('a', 13)) {
                        x = x.root(upgradeEffect('a', 13))
                    }
                    return x
                },
            },
            12: {
                type: 0,
                num: 2,
                get costD() {
                    const obj = {type: 0, exp: 1, main: [D(2), D(1.15), D(1.001)]}
                    
                    return obj
                },
                unlocked() { return true },
                unavail() {
                    let x = false
                    if (inChallenge('a', 16)) {
                        x = true
                    }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    j = D(0.1)
                    if (hasUpgrade('a', 14)) {
                        j = j.add(upgradeEffect('a', 14))
                    }
                    j = j.add(tmp.a.buyables[14].effect)
                    if (inChallenge('a', 15)) {
                        j = j.add(tmp.a.buyables[13].effect)
                    }
                    j = j.mul(tmp.a.buyables[15].effect)

                    if (i.gte(25)) {
                        i = i.div(25).sub(1).exp().mul(25)
                    }
                    i = Decimal.mul(j, i)
                    i = i.add(1)

                    if (!inChallenge('a', 15)) {
                        if (inChallenge('a', 13)) {
                            i = i.mul(tmp.a.buyables[13].effect)
                        } else {
                            i = i.pow(tmp.a.buyables[13].effect)
                        }
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.a.buyables[12])
                    return `${inChallenge('a', 13) ? "&times;" : '^'}${format(currEffect, 2)} AB1 effect.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.a.buyables[12])
                    const nextEffect = this.effect(player.a.buyables[12].add(1))
                    return `+${inChallenge('a', 13) ? "&times;" : '^'}${format(nextEffect.sub(currEffect), 2)} AB1 effect.` 
                },
                scaleModifEffective(x) {
                    if (x.gte(25)) {
                        x = x.div(25).sub(1).exp().mul(25)
                    }
                    if (hasUpgrade('a', 24)) {
                        x = x.div(upgradeEffect('a', 24))
                    }
                    x = x.div(tmp.a.energyEffect)
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    x = x.mul(tmp.a.energyEffect)
                    if (hasUpgrade('a', 24)) {
                        x = x.mul(upgradeEffect('a', 24))
                    }
                    if (x.gte(25)) {
                        x = x.div(25).ln().add(1).mul(25)
                    }
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
                    const obj = {type: 0, exp: 2, main: [D(Math.log10(6)), D(1.09), D(1.001)]}
                    
                    return obj
                },
                unlocked() { return hasUpgrade('a', 12) },
                unavail() {
                    let x = false
                    if (inChallenge('a', 16)) {
                        x = true
                    }
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    j = D(0.1)
                    if (hasUpgrade('a', 14)) {
                        j = j.add(upgradeEffect('a', 14))
                    }
                    if (challengeCompletions('a', 13).gte(1)) {
                        j = j.add(0.05)
                    }
                    j = j.mul(tmp.a.buyables[15].effect)

                    i = Decimal.mul(j, i)
                    if (!inChallenge('a', 15)) {
                        i = i.add(1)
                    }
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.a.buyables[13])
                    if (inChallenge('a', 15)) {
                        return `+${format(currEffect, 2)} AB2 effect base.` 
                    } else {
                        return `${inChallenge('a', 13) ? "&times;" : '^'}${format(currEffect, 2)} AB2 effect.` 
                    }
                },
                dispEffBase() {
                    const currEffect = this.effect(player.a.buyables[13])
                    const nextEffect = this.effect(player.a.buyables[13].add(1))
                    if (inChallenge('a', 15)) {
                        return `+${format(nextEffect.sub(currEffect), 2)} AB2 effect base.` 
                    } else {
                        return `+${inChallenge('a', 13) ? "&times;" : '^'}${format(nextEffect.sub(currEffect), 2)} AB2 effect.` 
                    }
                },
                scaleModifEffective(x) {
                    if (hasUpgrade('a', 24)) {
                        x = x.div(upgradeEffect('a', 24))
                    }
                    x = x.div(tmp.a.energyEffect)
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    x = x.mul(tmp.a.energyEffect)
                    if (hasUpgrade('a', 24)) {
                        x = x.mul(upgradeEffect('a', 24))
                    }
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            14: {
                type: 0,
                num: 4,
                get costD() {
                    const obj = {type: 0, exp: 2, main: [D(2), D(1.15), D(1.01)]}
                    
                    return obj
                },
                unlocked() { return challengeCompletions('a', 11).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    j = D(0.005)
                    j = j.mul(tmp.a.buyables[15].effect)

                    i = Decimal.mul(j, i)
                    i = i.add(1).pow(tmp.a.buyables[16].effect).sub(1)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.a.buyables[14])
                    return `+${format(currEffect, 3)} AB2 effect base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.a.buyables[14])
                    const nextEffect = this.effect(player.a.buyables[14].add(1))
                    return `+${format(nextEffect.sub(currEffect), 3)} AB2 effect.` 
                },
                scaleModifEffective(x) {
                    x = x.div(tmp.a.energyEffect)
                    if (hasUpgrade('a', 32)) {
                        x = x.div(upgradeEffect('a', 32))
                    }
                    return x
                },
                scaleModifCost(x) {
                    return x
                },
                scaleModifTarEff(x) {
                    if (hasUpgrade('a', 32)) {
                        x = x.mul(upgradeEffect('a', 32))
                    }
                    x = x.mul(tmp.a.energyEffect)
                    return x
                },
                scaleModifTarCost(x) {
                    return x
                },
            },
            15: {
                type: 0,
                num: 5,
                get costD() {
                    const obj = {type: 0, exp: 2, main: [D(33), D(1.05), D(1.001)]}
                    
                    return obj
                },
                unlocked() { return upgradeEffect('a', 33).gte(1) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    j = D(0.01)

                    i = Decimal.mul(j, i)
                    i = i.add(1)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.a.buyables[15])
                    return `&times;${format(currEffect, 3)} AB2-4 effect base.` 
                },
                dispEffBase() {
                    const currEffect = this.effect(player.a.buyables[15])
                    const nextEffect = this.effect(player.a.buyables[15].add(1))
                    return `+&times;${format(nextEffect.sub(currEffect), 3)} AB2-4 effect base.` 
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
            16: {
                type: 0,
                num: 6,
                get costD() {
                    const obj = {type: 0, exp: 3, main: [D(1.8260748027008264), D(1.05), D(1.01)]}
                    
                    return obj
                },
                unlocked() { return upgradeEffect('a', 33).gte(2) },
                unavail() {
                    let x = false
                    return x
                },
                preEffect(x, override) {
                    let i = D(x), j

                    j = D(0.5)

                    i = Decimal.mul(j, i)
                    i = i.add(1)
                    return i
                },
                dispEffect() {
                    const currEffect = this.effect(player.a.buyables[16])
                    return `^${format(currEffect, 3)} AB4 effect.`
                },
                dispEffBase() {
                    const currEffect = this.effect(player.a.buyables[16])
                    const nextEffect = this.effect(player.a.buyables[16].add(1))
                    return `+^${format(nextEffect.sub(currEffect), 3)} AB4 effect.` 
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
                for (let i = 0; i < 8; i++) {
                    obj[21 + i] = {
                        type: 1,
                        num: i + 1,
                        get costD() {
                            return  {
                                type: 0, exp: i === 0 ? 2 : 0, 
                                main: [
                                    [D(12),   D(2**1), D(2**8), D(2**27), D(2**64), D(2**125), D(2**216), D(2**343)][i],
                                    [D(1.1),  D(2**1), D(2**4), D(2**9),  D(2**16), D(2**25),  D(2**36),  D(2**49)][i],
                                    [D(1.01), D(2**1), D(2**2), D(2**3),  D(2**4),  D(2**5),   D(2**6),   D(2**7)][i]
                                ]
                            }
                        },
                        unlocked() { return i === 0 || (player.a.buyables[20 + i] ?? D(0)).gte(1) },
                        unavail() {
                            let x = false
                            return x
                        },
                        preEffect(x, override) {
                            let eff = D(x)

                            let j = D(2).pow(i + 1)
                            
                            eff = sumFactorial(eff.sub(1).max(0), j, D(0.2).mul(Decimal.pow(2, i + 1)))

                            return eff;
                        },
                        dispEffect() {
                            const currEffect = this.effect(player.a.buyables[21 + i])
                            return `This dimension's multiplier is increased by &times;${format(currEffect, 1)}.`
                        },
                        dispEffBase() {
                            const currEffect = this.effect(player.a.buyables[21 + i])
                            const nextEffect = this.effect(player.a.buyables[21 + i].add(1))
                            if (player.a.buyables[21 + i].gte(1e12)) {
                                return `This dimension's multiplier is increased by &times;${format(nextEffect.root(player.a.buyables[21 + i]), 1)}.` 
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
        };

        for (const upgrade of Object.values(upgrades)) {
            upgrade.effect = (x) => {
                if (upgrade.unavail()) { 
                    return upgrade.preEffect(D(0), true)
                }
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected as input in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }

                let eff = upgrade.preEffect(D(x), false)
                if (Decimal.isNaN(x)) {
                    throw new Error(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected as effect in upgrade type ${upgrade.type} #${upgrade.num} effect!`)
                }
                return eff
            }

            upgrade.cost = (x) => {
                if (upgrade.unavail()) { return D(Infinity) }
                let i, j, k;
                j = x
                k = upgrade.costD.main

                if (upgrade.type === 0) {
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
                    x = player.a.subpoints;
                }
                if (upgrade.type === 1) {
                    if (upgrade.num === 1) {
                        x = player.a.subpoints;
                    } else {
                        x = player.a.energy;
                    }
                }
                
                if (x.lt(upgrade.costD.main[0])) { return D(-1e-12) }

                let i, j;
                i = D(x)
                j = upgrade.costD.main
                if (Decimal.isNaN(i)) {
                    throw new Error(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected in target resource!`)
                }
                i = upgrade.scaleModifTarCost(i)

                if (Decimal.isNaN(i)) {
                    console.info(`PROBLEM FUNCTION:`)
                    console.info(upgrade.scaleModifTarCost)
                    throw new Error(`[Layer: a, Type: buyable, ID: ${upgrade.id}]NaN detected in target of id${upgrade.id} after modifier target cost!`)
                }
                i = i.layeradd10(-upgrade.costD.exp)

                if (Decimal.isNaN(i)) {
                    // it's likely only NaN because the value is too low and the amount of logs would make it NaN
                    // or something earlier up has caused crap to happen, make it default into a 0 value
                    console.warn(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} before scaling!`)
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
                    console.warn(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after main scaling! (main scaling causing NaN?)`)
                    return D(0)
                }

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after modifers before scaleModifTarEff! (modifiers causing NaN?)`)
                    return D(0)
                }

                i = upgrade.scaleModifTarEff(i)

                if (upgrade.type === 0) {
                    if (inChallenge('a', 14)) {
                        i = i.max(1).div(1).ln().mul(tmp.a.challenges[14].getDepths).add(1).root(tmp.a.challenges[14].getDepths).mul(1)
                    }
                }

                if (Decimal.isNaN(i)) {
                    console.warn(`[Layer: a, Type: buyable, ID: ${upgrade.id}] NaN detected (set to 0) after layeradd10 in target of id${upgrade.id} after scaleModifTarEff! (scaleModifTarEff causing NaN?)`)
                    return D(0)
                }
                return i
            }

            upgrade.title = () => { 
                if (upgrade.type === 0) {
                    return `Alternate Buyable ${upgrade.num}` 
                }
                if (upgrade.type === 1) {
                    return `Alternate Dimension ${upgrade.num}` 
                }
            },

            upgrade.stupidHack = () => {
                return shiftDown
            }

            upgrade.display = () => {
                // console.log(`%cbuyable id ${upgrade.id} detected ${shiftDown?'yes':'no'} shift`, `color: ${shiftDown?'#00FF00':'#FF0000'}`)
                let txt;
                if (upgrade.type === 1) {
                    txt = `Amount: ${format(player.a.dimensionAccu[upgrade.num - 1])} (${format(player.a.buyables[upgrade.id])}), Mult: &times;${format(upgrade.effect(player.a.buyables[upgrade.id]))}<br>`
                } else {
                    txt = `You have ${format(player.a.buyables[upgrade.id], 0)} ${["Alt. Point"][upgrade.type]} Buyable ${upgrade.num}.<br>`
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
                    let hasExtra = false
                    if (upgrade.type === 0 && (upgrade.num === 1 || upgrade.num === 2)) {
                        if (!hasExtra) {
                            txt += `<br>`
                        }
                        txt += `<br>Cost and effect scales exponentially after ${format(25)} purchases.`
                    }
                } else {
                    txt += `Effect: `
                    txt += upgrade.dispEffect() 
                    txt += `<br>Cost: ${format(upgrade.cost())} `
                    if (upgrade.type === 0) {
                        txt += `Alt. Points`
                    }
                    if (upgrade.type === 1) {
                        if (upgrade.num === 1) {
                            txt += `Alt. Points`
                        } else {
                            txt += `Alt. Energy`
                        }
                    }
                }

                return txt
            }
            upgrade.canAfford = () => {
                let resource;
                if (upgrade.type === 0) {
                    resource = player.a.subpoints;
                }
                if (upgrade.type === 1) {
                    if (upgrade.num === 1) {
                        resource = player.a.subpoints;
                    } else {
                        resource = player.a.energy;
                    }
                }
                return resource.gte(upgrade.cost());
            }
            upgrade.buy = () => {
                if (upgrade.type === 0) {
                    player.a.subpoints = player.a.subpoints.sub(upgrade.cost());
                }
                if (upgrade.type === 1) {
                    if (upgrade.num === 1) {
                        player.a.subpoints = player.a.subpoints.sub(upgrade.cost());
                    } else {
                        player.a.energy = player.a.energy.sub(upgrade.cost());
                    }
                }
                addBuyables(upgrade.layer, upgrade.id, 1);
            };
            upgrade.buyMax = () => {
                setBuyableAmount(upgrade.layer, upgrade.id, upgrade.target().add(1).floor().max(player.a.buyables[upgrade.id]))
            }
        }
        return upgrades;
    })(),
    challenges: {
        11: {
            unlocked() {
                let i = false
                if (player.a.total.gte(1)) { i = true }
                return i
            },
            name: "Strengthened Dilation, Again",
            challengeDescription: "Point and Alt. Point dilation is significantly stronger.",
            goal() {
                return {
                    alt: D(1e40).root(tmp.a.effect.ln().add(1)),
                    norm: D('ee2e11').log10().log10().root(tmp.a.effect.ln().add(1)).pow10().pow10()
                }
            },
            goalDescription() {
                return `Get ${format(tmp.a.challenges[11].goal.alt)} Alt. Points and ${format(tmp.a.challenges[11].goal.norm)} Points.`
            },
            canComplete() { return player.a.subpoints.gte(tmp.a.challenges[11].goal.alt) && player.points.gte(tmp.a.challenges[11].goal.norm) },
            rewardDescription: `Unlock another Point and Alt. Point buyable, and Point dilation is slightly weakened.`,
            onEnter() {
                const SAFE_UPGRADES = [25, 34]
                
                player.a.upgrades = player.a.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
            },
            getDepths() {
                let i = inChallenge('a', 11, true) ? D(1) : D(0)
                i = i.add(tmp.a.challenges[12].getDepths)
                return i
            }
        },
        12: {
            unlocked() {
                let i = false
                if (challengeCompletions('a', 11).gte(1)) { i = true }
                return i
            },
            name: "In Shambles",
            challengeDescription: "You are trapped in (Strengthened Dilation, Again) and Prestige gain are log'd.",
            goal() {
                return {
                    alt: D('1e1200').root(tmp.a.effect.ln().add(1)),
                    norm: D('ee5e12').log10().log10().root(tmp.a.effect.ln().add(1)).pow10().pow10()
                }
            },
            goalDescription() {
                return `Get ${format(tmp.a.challenges[12].goal.alt)} Alt. Points and ${format(tmp.a.challenges[12].goal.norm)} Points.`
            },
            canComplete() { return player.a.subpoints.gte(tmp.a.challenges[12].goal.alt) && player.points.gte(tmp.a.challenges[12].goal.norm) },
            rewardDescription: `Unlock 10 more alt. upgrades.`,
            onEnter() {
                const SAFE_UPGRADES = [25, 34]
                
                player.a.upgrades = player.a.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
            },
            getDepths() {
                let i = inChallenge('a', 12, true) ? D(1) : D(0)

                return i
            }
        },
        13: {
            unlocked() {
                let i = false
                if (hasUpgrade('a', 25)) { i = true }
                return i
            },
            name: "Anti-Multiplicity",
            challengeDescription: "Point gain is log'd and AB2-3's effects are changed to &times; instead of ^.",
            goal() {
                return {
                    alt: D('1e120').root(tmp.a.effect.ln().add(1)),
                    norm: D('ee10').log10().log10().root(tmp.a.effect.ln().add(1)).pow10().pow10()
                }
            },
            goalDescription() {
                return `Get ${format(tmp.a.challenges[13].goal.alt)} Alt. Points and ${format(tmp.a.challenges[13].goal.norm)} Points.`
            },
            canComplete() { return player.a.subpoints.gte(tmp.a.challenges[13].goal.alt) && player.points.gte(tmp.a.challenges[13].goal.norm) },
            rewardDescription: `Luck Essence is autogenerated and can accumulate. AB3's effect base is increased by +0.05.`,
            onEnter() {
                const SAFE_UPGRADES = [25, 34]
                
                player.a.upgrades = player.a.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
            },
            getDepths() {
                let i = inChallenge('a', 13, true) ? D(1) : D(0)

                return i
            }
        },
        14: {
            unlocked() {
                let i = false
                if (hasUpgrade('a', 25)) { i = true }
                return i
            },
            name: "Exponential Growth in the Wrong Way",
            challengeDescription: "All Point, PP, Quaternion, and Luck Buyables and Dimensions and Alt. Buyables scale exponentially faster.",
            goal() {
                return {
                    alt: D('e125').root(tmp.a.effect.ln().add(1)),
                    norm: D('eee9').log10().log10().root(tmp.a.effect.ln().add(1)).pow10().pow10()
                }
            },
            goalDescription() {
                return `Get ${format(tmp.a.challenges[14].goal.alt)} Alt. Points and ${format(tmp.a.challenges[14].goal.norm)} Points.`
            },
            canComplete() { return player.a.subpoints.gte(tmp.a.challenges[14].goal.alt) && player.points.gte(tmp.a.challenges[14].goal.norm) },
            rewardDescription() { return `Time since Alt. Prestige raises Alt. Point gain and M1 Luck.<br>Currently: ^${format(this.rewardEffect(), 3)}.` },
            rewardEffect() { return player.a.timeInA.max(0).div(5).add(1).ln().div(5).add(1) },
            onEnter() {
                const SAFE_UPGRADES = [25, 34]
                
                player.a.upgrades = player.a.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
            },
            getDepths() {
                let i = inChallenge('a', 14, true) ? D(1) : D(0)

                return i
            }
        },
        15: {
            unlocked() {
                let i = false
                if (hasUpgrade('a', 25)) { i = true }
                return i
            },
            name: "Dimensional Superiority",
            challengeDescription: "Point multipliers and exponents are raised ^0.1 to the exponent except for prestige dimensions. AB3's effect only adds to AB2's effect base.",
            goal() {
                return {
                    alt: D('e20000000').root(tmp.a.effect.ln().add(1)),
                    norm: D('ee2e30').log10().log10().root(tmp.a.effect.ln().add(1)).pow10().pow10()
                }
            },
            goalDescription() {
                return `Get ${format(tmp.a.challenges[15].goal.alt)} Alt. Points and ${format(tmp.a.challenges[15].goal.norm)} Points.`
            },
            canComplete() { return player.a.subpoints.gte(tmp.a.challenges[15].goal.alt) && player.points.gte(tmp.a.challenges[15].goal.norm) },
            rewardDescription() { return `Weaken all Prestige Dimension costs and AB1's effectiveness is squared.` },
            onEnter() {
                const SAFE_UPGRADES = [25, 34]
                
                player.a.upgrades = player.a.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
            },
            getDepths() {
                let i = inChallenge('a', 15, true) ? D(1) : D(0)

                return i
            }
        },
        16: {
            unlocked() {
                let i = false
                if (hasUpgrade('a', 25)) { i = true }
                return i
            },
            name: "Crap",
            challengeDescription: "Quaternions and Pets may not be earned. AB2-3 are disabled.",
            goal() {
                return {
                    alt: D('e4000000').root(tmp.a.effect.ln().add(1)),
                    norm: D('eee12').log10().log10().root(tmp.a.effect.ln().add(1)).pow10().pow10()
                }
            },
            goalDescription() {
                return `Get ${format(tmp.a.challenges[16].goal.alt)} Alt. Points and ${format(tmp.a.challenges[16].goal.norm)} Points.`
            },
            canComplete() { return player.a.subpoints.gte(tmp.a.challenges[16].goal.alt) && player.points.gte(tmp.a.challenges[16].goal.norm) },
            rewardDescription() { return `Quaternions and total Pet levels boost each other.<br>Currently: ^${format(this.rewardEffect().qu, 3)} to exp. quaternions, ^${format(this.rewardEffect().pet, 3)} pet gain and alt. pt. exp` },
            rewardEffect() {
                return {
                    qu: Object.values(tmp.l.petLevels).reduce((total, item) => { return Decimal.floor(item).add(total) }, D(0)).max(1).log10().div(10).add(1),
                    pet: player.q.points.max(1e10).log10().log10().log10().div(100).add(1)
                }
            },
            onEnter() {
                const SAFE_UPGRADES = [25, 34]
                
                player.a.upgrades = player.a.upgrades.filter((value) => { return SAFE_UPGRADES.includes(value) });
            },
            getDepths() {
                let i = inChallenge('a', 16, true) ? D(1) : D(0)

                return i
            }
        },
    }
})