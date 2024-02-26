"use strict";

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
            j.exp = j.exp.div(tmp.p.buyables[27].effect.ess)

            i = D(3);
            i = i.add(tmp.p.buyables[22].effect.exp)
            i = player.p.total.add(1).mul(2).pow(i).div(Decimal.pow(2, i));
            i = i.mul(tmp.p.buyables[21].effect.ppe)
            i = i.mul(tmp.p.buyables[24].effect.ppe)
            i = i.pow(tmp.p.buyables[26].effect.ppe)

            let pps = i.mul(diff)
            let prev = player.p.essence
            player.p.essence = player.p.essence.max(1).pow(j.exp).log10().pow(j.dilate).pow10().add(pps).log10().root(j.dilate).pow10().root(j.exp);
            player.p.essencePS = player.p.essence.sub(prev).div(diff)
            player.p.bestEssence = Decimal.max(player.p.essence, player.p.bestEssence);
        }

        if (inChallenge('p', 13)) {
            player.p.ssChalBest = Decimal.max(player.p.ssChalBest, player.points)
        }

        if (hasUpgrade('p', 11)) {
            tmp.p.buyables[11].buyMax()
            tmp.p.buyables[12].buyMax()
            tmp.p.buyables[13].buyMax()
        }
    },
    effect(){
        let i = player.p.total
        let j = [D(3), D(1.5)]
        let sc = [{ start: D(1e40), pow: D(1) }, { start: D(1e60), pow: D(1) }]
        sc[0].start = sc[0].start.mul(tmp.p.buyables[27].effect.ppss)
        i = i.max(0).mul(Decimal.pow(2, j[0]).sub(1)).add(1).root(j[0]).log10().add(1).root(j[1]).sub(1).pow10().sub(1).pow10();
        if (i.gte(sc[0].start)) { i = scale(i, 0, false, sc[0].start, sc[0].pow, D(0.5)) }
        if (i.gte(sc[1].start)) { i = scale(i, 1.3, false, sc[1].start, sc[1].pow, D(0.1)) }
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
        return player.points.lt(req) ? new Decimal(0) : player.points.log10().add(625).sub(req.log10()).sqrt().mul(10).sub(250).pow10();
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
                ["buyables", [2]],
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
                ["upgrades", [1]],
            ],
            unlocked(){
                return player.p.total.gte(1e5)
            },
        },
    },
    buyables: {
        11: {
            title: "Upgrade 1",
            get costD() {
                let i = [D(10),  D(2),  D(1.02)]
                return i
            },
            unlocked() {
                let i = false
                if (player.bestPoints.gte(10)) { i = true }
                return i
            },
            effect(x) {
                let i = x, j
                i = i.add(tmp.p.buyables[13].effect.free)
                if (challengeCompletions("p", 12).gte(5)) { i = i.mul(1.05) }
                if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(9)) { i = i.sub(1).div(3).add(1) }
                j = D(2)
                j = j.add(tmp.p.buyables[12].effect)
                j = j.mul(tmp.p.buyables[13].effect.base)
                if (hasUpgrade('p', 14)) { j = j.add(upgradeEffect(this.layer, 14)) }
                i = Decimal.pow(j, i)
                if (challengeCompletions("p", 12).gte(8)) { i = i.log10().pow([1, 1.01, 1.0201, 1.050703][challengeCompletions("p", 12).sub(7).max(0).toNumber()]).pow10() }
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                if (inChallenge('p', 13)) { j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) }
                if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { j = j.pow(2) }
                if (j.gte(1000)) { j = scale(j, 2.2, false, D(1000), D(1), D(3)) }

                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);
                i = i.div(tmp.p.buyables[24].effect.up1c)

                return i
            },
            target(x = player.points) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                j = j.mul(tmp.p.buyables[24].effect.up1c)
                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                if (j.gte(1000)) { j = scale(j, 2.2, true, D(1000), D(1), D(3)) }
                if (inChallenge('p', 12) && challengeCompletions("p", 12).gte(5)) { i = i.root(2) }
                if (inChallenge('p', 13)) { i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) }
                return i
            },
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[11], 0)} Upgrade 1.<br>Effect Base: ${format(this.effect(player.p.buyables[11].add(1)).div(this.effect(player.p.buyables[11])), 2)}x point gain.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[11], 0)} Upgrade 1.<br>Effect: ${format(tmp.p.buyables[11].effect)}x point gain.<br>Cost: ${format(this.cost())} Points` 
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[11].target.add(1).floor())
            }
        },
        12: {
            title: "Upgrade 2",
            get costD() {
                let i = [D(250),  D(3),  D(1.01)]
                return i
            },
            unlocked() {
                let i = false
                if (player.bestPoints.gte(100)) { i = true }
                return i
            },
            effect(x) {
                if (inChallenge('p', 12)) {
                    return new Decimal(0)
                }

                let i = x, j
                j = D(0.25)
                j = j.add([0, 0.025, 0.055, 0.09, 0.13, 0.175, 0.225, 0.28, 0.34, 0.405, 0.55][challengeCompletions("p", 12).toNumber()]);
                i = Decimal.mul(j, i)
                if (challengeCompletions("p", 12).gte(3)) { i = i.add(1).pow(1.1).sub(1) }
                i = i.add(1).pow(tmp.p.challenges[13].rewardEffect).sub(1)
                return i
            },
            cost(x) { 
                if (inChallenge('p', 12)) {
                    return new Decimal(Infinity)
                }

                let i, j, k;
                j = x;
                k = this.costD;
                if (inChallenge('p', 13)) { j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) }
                if (challengeCompletions("p", 12).gte(6)) { j = j.div([1, 1.03, 1.08, 1.15, 1.225, 1.4][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.points) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                if (inChallenge('p', 12)) { return new Decimal(-1e-12) }

                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }
                if (challengeCompletions("p", 12).gte(6)) { i = i.mul([1, 1.03, 1.08, 1.15, 1.225, 1.4][challengeCompletions("p", 12).sub(5).max(0).toNumber()]) }
                if (inChallenge('p', 13)) { i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) }
                return i
            },
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[12], 0)} Upgrade 2.<br>Effect Base: +${format(this.effect(player.p.buyables[12].add(1)).sub(this.effect(player.p.buyables[12])), 2)} Upgrade 1 base.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[12], 0)} Upgrade 2.<br>Effect: +${format(tmp.p.buyables[12].effect, 3)} Upgrade 1 base.<br>Cost: ${format(this.cost())} Points` 
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[12].target.add(1).floor())
            }
        },
        13: {
            title: "Upgrade 3",
            get costD() {
                let i = [D(1e6),  D(10),  D(2)]
                return i
            },
            unlocked() {
                let i = false
                if (player.bestPoints.gte(1e5) && challengeCompletions("p", 11).gte(1)) { i = true }
                return i
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
            cost(x) { 
                let i, j, k;
                j = x;
                j = j.div(tmp.p.buyables[21].effect.up3s)
                if (inChallenge('p', 13)) { j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) }
                if (j.gte(12)) { j = scale(j, 0, false, D(12), D(1), D(2)) }
                if (hasUpgrade('p', 12)) { j = j.sub(upgradeEffect(this.layer, 12)) }

                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.points) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                if (hasUpgrade('p', 12)) { i = i.add(upgradeEffect(this.layer, 12)) }
                if (i.gte(12)) { i = scale(i, 0, true, D(12), D(1), D(2)) }
                if (inChallenge('p', 13)) { i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) }
                i = i.mul(tmp.p.buyables[21].effect.up3s)
                return i
            },
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[13], 0)} Upgrade 3.<br>Effect Bases: +${format(this.effect(player.p.buyables[13].add(1)).free.sub(this.effect(player.p.buyables[13]).free), 2)} free UPG1, x${format(this.effect(player.p.buyables[13].add(1)).base.div(this.effect(player.p.buyables[13]).base), 2)} UPG1 base.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[13], 0)} Upgrade 3.<br>Effect: +${format(tmp.p.buyables[13].effect.free, 2)} free UPG1, x${format(tmp.p.buyables[13].effect.base, 2)} UPG1 base.<br>Cost: ${format(this.cost())} Points` 
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[13].target.add(1).floor())
            }
        },
        14: {
            title: "Upgrade 4",
            get costD() {
                let i = [D(20),  D(1.1),  D(1.001)]
                return i
            },
            unlocked() {
                let i = false
                if (hasUpgrade('p', 11)) { i = true }
                return i
            },
            effect(x) {
                let i = x, j
                j = D(1.01)
                j = j.add(tmp.p.buyables[26].effect.up4b)
                i = Decimal.pow(j, i)
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                if (inChallenge('p', 13)) { j = j.add(1).log10().add(1).pow(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1).div(2) }
                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i.pow10()
            },
            target(x = player.points) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x.max(1).log10()
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                if (inChallenge('p', 13)) { i = i.mul(2).add(1).log10().add(1).root(Decimal.pow(1.5, tmp.p.challenges[13].getDepths)).sub(1).pow10().sub(1) }
                return i
            },
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[14], 0)} Upgrade 4.<br>Effect Base: ^${format(this.effect(player.p.buyables[14].add(1)).div(this.effect(player.p.buyables[14])), 2)} point gain.<br>Cost Formula: 10<sup>${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup></sup>` 
                }
                return `You have ${format(player.p.buyables[14], 0)} Upgrade 4.<br>Effect: ^${format(tmp.p.buyables[14].effect, 3)} points.<br>Cost: ${format(this.cost())} Points` 
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[14].target.add(1).floor())
            }
        },
        21: {
            /**
             *     
                new Upgrade('pp1',  0,  c.d10,   {type: 0, main: [c.d10,   D(10 ** 0.5), D(10 ** 0.0025)]}, 1),
                new Upgrade('pp2',  1,  D(80),   {type: 1, main: [c.e2,    c.d2,   D(1.3)]},    1),
                new Upgrade('pp3',  2,  c.e4,    {type: 0, main: [D(1e5),  c.d10,  1]},      1),
                new Upgrade('pp4',  3,  c.e6,    {type: 1, main: [D(1e7),  c.d5,   D(c.d1_2)]}, 1),
                new Upgrade('pp5',  4,  c.e6,    {type: 0, main: [D(1e8),  1,   c.d2]},      1),
                new Upgrade('pp6',  5,  D(1e9),  {type: 0, main: [c.e10,   c.e2,   D(1.1)]},    1),
                new Upgrade('pp7',  6,  c.e10,   {type: 0, main: [D(1e12), c.e6,   1]},      1),
                new Upgrade('pp8',  7,  D(1e14), {type: 0, main: [D(1e15), c.e4,   c.d3]},      1),
                new Upgrade('pp9',  8,  D(1e20), {type: 0, main: [D(1e20), D(1e5), D(20)]},     1),
                new Upgrade('pp10', 9,  D(1e32), {type: 1, main: [D(1e32), c.e3,   D(2.2)]},    1),
                new Upgrade('pp11', 10, D(1e39), {type: 1, main: [D(1e40), c.e2,   c.d4]},      1),
             */
            title: "PP Upgrade 1",
            get costD() {
                let i = [D(10),  D(10 ** 0.5),  D(10 ** 0.0025)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(10)) { i = true }
                return i
            },
            effect(x) {
                let i = x, j
                i = i.mul(tmp.p.buyables[23].effect.peu1)
                j = D(2.2)
                j = j.add(tmp.p.buyables[25].effect.ppu1)
                i = {
                    ppe: Decimal.pow(j, i.add(1).pow(1.2).log10().add(1).pow(0.9).sub(1).pow10().sub(1)), 
                    up3s: i.add(1).pow(0.7).sub(1).mul(0.03).add(1)
                };
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                return i
            },
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[21], 0)} PP Upgrade 1.<br>Effect Base: x${format(this.effect(player.p.buyables[21].add(1)).ppe.div(this.effect(player.p.buyables[21]).ppe), 2)} Essence, -${formatPerc(this.effect(player.p.buyables[21].add(1)).up3s.div(this.effect(player.p.buyables[21]).up3s))} Upgrade 3 scaling.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[21], 0)} PP Upgrade 1.<br>Effect: x${format(tmp.p.buyables[21].effect.ppe, 2)} Essence, -${formatPerc(tmp.p.buyables[21].effect.up3s)} Upgrade 3 scaling.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[21].target.add(1).floor())
            }
        },
        22: {
            title: "PP Upgrade 2",
            get costD() {
                let i = [D(100),  D(2),  D(1.3)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(80)) { i = true }
                return i
            },
            effect(x) {
                let i = x, j
                if (i.lt(1)) { return {exp: D(0), pps: D(1)}; }
                j = D(0.15); // less = it slows down less
                i = {
                    exp: i.ln().mul(j).add(1).root(j).mul(0.5),
                    pps: player.p.essence.add(1).pow(i.ln().add(1).mul(0.3)).log10().pow(i.ln().mul(0.01).add(1)).pow10()
                };
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = Decimal.pow(k[1], j.pow(k[2])).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD;

                i = j.div(k[0]).log(k[1]).root(k[2]);
                return i
            }, 
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[22], 0)} PP Upgrade 2.<br>Effect Base: +${format(this.effect(player.p.buyables[22].add(1)).exp.sub(this.effect(player.p.buyables[22]).exp), 2)} Essence exponent, Essence boosts points by ${format(this.effect(player.p.buyables[22].add(1)).pps.div(this.effect(player.p.buyables[22]).pps), 2)}x.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x<sup>${format(this.costD[2], 3)}</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[22], 0)} PP Upgrade 2.<br>Effect: +${format(tmp.p.buyables[22].effect.exp, 2)} Essence exponent, Essence boosts points by ${format(tmp.p.buyables[22].effect.pps, 2)}x.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[22].target.add(1).floor())
            }
        },
        23: {
            title: "PP Upgrade 3",
            get costD() {
                let i = [D(1e5),  D(10),  D(1)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(1e4)) { i = true }
                return i
            },
            effect(x) {
                let i = x
                i = {
                    peu1: i.add(10).mul(10).sqrt().div(10).sub(1).mul(2).add(1),
                    free: i.add(10).mul(100).cbrt().div(20).sub(0.5).mul(3)
                }
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                return i
            },
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[23], 0)} PP Upgrade 3.<br>Effect Base: PP Upgrade 1 is ${format(this.effect(player.p.buyables[23].add(1)).peu1.div(this.effect(player.p.buyables[23]).peu1).sub(1).mul(100))}% more effective, +${format(this.effect(player.p.buyables[23].add(1)).free.sub(this.effect(player.p.buyables[23]).free), 2)} Upgrade 3 Free base.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x</sup> × ${format(this.costD[2], 3)}<sup>x<sup>2</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[23], 0)} PP Upgrade 3.<br>Effect: PP Upgrade 1 is ${format(tmp.p.buyables[23].effect.peu1.sub(1).mul(100))}% more effective, +${format(tmp.p.buyables[23].effect.free, 2)} Upgrade 3 Free base.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[23].target.add(1).floor())
            }
        },
        24: {
            title: "PP Upgrade 4",
            get costD() {
                let i = [D(1e7),  D(5),  D(1.2)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(1e6)) { i = true }
                return i
            },
            effect(x) {
                let i = x, j
                if (i.lt(1)) { return {ppe: D(1), up1c: D(1)}; }
                i = {
                    ppe: player.points.add(1).log10().pow(i.cbrt()),
                    up1c: Decimal.pow(20, i.pow(0.7))
                };
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = Decimal.pow(k[1], j.pow(k[2])).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD;

                i = j.div(k[0]).log(k[1]).root(k[2]);
                return i
            }, 
            display() { 
                if (shiftDown) {
                    return `You have ${format(player.p.buyables[24], 0)} PP Upgrade 4.<br>Effect Base: x${format(this.effect(player.p.buyables[24].add(1)).ppe.div(this.effect(player.p.buyables[24]).ppe), 2)} Essence from Points, Upgrade 1's cost is divided by ${format(this.effect(player.p.buyables[24].add(1)).up1c.div(this.effect(player.p.buyables[24]).up1c), 2)}.<br>Cost Formula: ${format(this.costD[0])} × ${format(this.costD[1], 2)}<sup>x<sup>${format(this.costD[2], 3)}</sup></sup>` 
                }
                return `You have ${format(player.p.buyables[24], 0)} PP Upgrade 4.<br>Effect: x${format(tmp.p.buyables[24].effect.ppe, 2)} Essence from Points, Upgrade 1's cost is divided by ${format(tmp.p.buyables[24].effect.up1c, 2)}.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[24].target.add(1).floor())
            }
        },
        25: {
            title: "PP Upgrade 5",
            get costD() {
                let i = [D(1e8),  D(1),  D(2)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(1e7)) { i = true }
                return i
            },
            effect(x) {
                let i = x
                i = {
                    ppu1: i.add(1).ln().add(1).pow(0.9).sub(1).exp().sub(1).div(8.34),
                    pts: i.mul(0.025).add(1).ln().add(1)
                }
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                return i
            },
            display() { 
                return `You have ${format(player.p.buyables[25], 0)} PP Upgrade 5.<br>Effect: +${format(tmp.p.buyables[25].effect.ppu1, 3)} PP Upgrade 1 base for Essence gain, Point slowdown after ${format(1e10)} is ${formatPerc(tmp.p.buyables[25].effect.pts, 3)} slower.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[25].target.add(1).floor())
            }
        },
        26: {
            title: "PP Upgrade 6",
            get costD() {
                let i = [D(1e10),  D(100),  D(1.1)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(1e10)) { i = true }
                return i
            },
            effect(x) {
                let i = x
                i = {
                    ppe: Decimal.pow(1.01, i.pow(0.75)),
                    up4b: i.mul(0.1).add(1).ln().mul(0.02)
                }
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                return i
            },
            display() { 
                return `You have ${format(player.p.buyables[26], 0)} PP Upgrade 6.<br>Effect: ^${format(tmp.p.buyables[26].effect.ppe, 3)} Essence gain, +${format(tmp.p.buyables[26].effect.up4b, 4)} Upgrade 4 base.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[25].target.add(1).floor())
            }
        },
        27: {
            title: "PP Upgrade 7",
            get costD() {
                let i = [D(1e12),  D(1e6),  D(1)]
                return i
            },
            unlocked() {
                let i = false
                if (player.p.bestEssence.gte(1e11)) { i = true }
                return i
            },
            effect(x) {
                let i = x
                i = {
                    ess: i.mul(0.01).add(1).ln().add(1).pow(2),
                    ppss: Decimal.pow(20, i)
                }
                return i
            },
            cost(x) { 
                let i, j, k;
                j = x;
                k = this.costD;
                i = k[2].pow(j.pow(2)).mul(k[1].pow(j)).mul(k[0]);

                return i
            },
            target(x = player.p.essence) {
                if (x.lte(this.costD[0])) { return D(-1e-12) }
                let i, j, k;
                j = x
                k = this.costD.map((x) => Decimal.log10(x));

                if (k[2].eq(0)) { 
                    i = j.max(1).log10().sub(k[0]).div(k[1]);
                } else {
                    i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(4).add(k[1].pow(2)).sqrt().sub(k[1]).div(k[2]).div(2);
                }

                return i
            },
            display() { 
                return `You have ${format(player.p.buyables[27], 0)} PP Upgrade 7.<br>Effect: Essence's slowdown exponent is reduced by -${formatPerc(tmp.p.buyables[27].effect.ess, 3)}, x${format(tmp.p.buyables[27].effect.ppss, 2)} PP effect softcap start.<br>Cost: ${format(this.cost())} Essence` 
            },
            canAfford() { return player.p.essence.gte(this.cost()) },
            buy() {
                player.p.essence = player.p.essence.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                setBuyableAmount(this.layer, this.id, tmp.p.buyables[25].target.add(1).floor())
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
                        return `Upgrade 2 is disabled.`
                    case 1:
                        return `Upgrade 2 is disabled.`
                    case 2:
                        return `Upgrade 2 is disabled.`
                    case 3:
                        return `Upgrade 2 is disabled.`
                    case 4:
                        return `Upgrade 2 is disabled.`
                    case 5:
                        return `Upgrade 2 is disabled and Upgrade 1 scales faster.`
                    case 6:
                        return `Upgrade 2 is disabled and Upgrade 1 scales faster.`
                    case 7:
                        return `Upgrade 2 is disabled, Upgrade 1 scales faster, and point gain is reduced.`
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
                        return `UP2's base is increased by +${format(0.145, 3)}, scales ${formatPerc(1.1428571428571428, 3)} slower, and UP1's effect is dilated by ^${format(1.03, 3)}`
                    case 10:
                        return `Maxed out lol`
                    default:
                        throw new Error(`challenge 12 reward desc sucks lmao ${challengeCompletions("p", 12).toNumber()} out of bounds?`)
                }
            },
            goal() {
                let lim = 9
                return [D(1e6), D(1e8), D(1e10), D(1e12), D(1e14), D(1e14), D(1e16), D(1e13), D(1e17), D(1e18)][challengeCompletions("p", 12).min(lim).toNumber()]
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
            description: "Unlock Upgrade and Challenge 4, and unlock autobuyers for Upgrades 1-3",
            cost: new Decimal(200000),
            unlocked() { return true},
        },
        12: {
            description: "Prestige Essence delays Upgrade 3 cost.",
            cost: new Decimal(1e7),
            unlocked() { return true },
            effect() { 
                let ret = player[this.layer].essence.max(1e5).log(1e5).pow(2.5).sub(1)
                return ret;
            },
            effectDisplay() { return `-${format(this.effect(), 3)} purchases` }, 
        },
        13: {
            description: "Keep Upgrade 4 on PP reset, and unlock a new prestige layer. (You can continue for a long time after this unlock, don't worry)",
            cost: new Decimal(1e8),
            unlocked() { return true},
        },
        14: {
            description: "Upgrade 1's base is increased based off of Prestige Essence",
            cost: new Decimal(1e10),
            unlocked() { return true },
            effect() { 
                let ret = player[this.layer].essence.max(1).log10().pow(2)
                return ret;
            },
            effectDisplay() { return `+${format(this.effect(), 3)}` }, 
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
        total: [D(0), D(0), D(0), D(0)],
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
        return ` multiplying prestiige point gain by ${format(tmp.q.effect, 2)}x`
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
        setBuyableAmount('p', "24", D(0))
        setBuyableAmount('p', "25", D(0))
        player.p.challenges[11] = D(0)
        player.p.challenges[12] = D(0)
        player.p.challenges[13] = D(0)
        player.p.challenges[14] = D(0)
        player.p.upgrades = []
    },
})
