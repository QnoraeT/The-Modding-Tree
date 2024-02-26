"use strict";

try {
    clearInterval(INTERVALYUM);
} catch {
    console.log(`cannot clear intervalyum`);
}

let INTERVALYUM;

try {
    INTERVALYUM = setInterval(doThing, 1000);
} catch {
    console.log(`cannot set intervalyum`);
}

try {
    if (anotherGame.pps === undefined) {
        var anotherGame = {};
    }
} catch {
    var anotherGame = {};
}

function initVal(indexe, value) {
    if (anotherGame[indexe] === undefined) {
        anotherGame[indexe] = value;
    }
}

class Upgrade {
    constructor(id, listItem, initCost, costD, uType) {
        this.id = id;
        this.item = listItem;
        this.initCost = initCost;
        this.costD = costD;
        this.useType = uType;
    }

    get show() {
        if (this.id === 'norm3' && anotherGame.ppChal.sd.completions.lt(c.d1)) { return false; }
        if (this.id === 'norm2' && ppChal.nu2.depth.gt(c.d1)) { return false; }
        let i = false;
        switch (this.useType) {
            case 0:
                if (anotherGame.bestPoints.gte(this.initCost)) {
                    i = true;
                }
                break;
            case 1:
                if (anotherGame.ppEssence.best.gte(this.initCost)) {
                    i = true;
                }
                break;
            default:
                throw new Error(`upgrade ${this.id} invalid use in show: ${this.useType}`);
        }
        return i;
    }
    
    get bought() {
        switch (this.useType) {
            case 0:
                return anotherGame.upgs[this.item];
            case 1:
                return anotherGame.ppEssence.upgBought[this.item];
            default:
                throw new Error(`upgrade ${this.id} invalid use in bought: ${this.useType}`);
        }
    }

    get cost() {
        if (ppChal.nu2.depth.gte(c.d1) && this.id === 'norm2') { return D(Infinity); }
        let i, j, k;

        j = this.bought;
        k = this.costD.main;
        if (this.id === 'norm3') { j = j.div(ppEUpg[0].effect.up3s); }

        switch (this.costD.type) {
            case 0:
                i = k[2].pow(j.pow(c.d2)).mul(k[1].pow(j)).mul(k[0]);
                break;
            case 1:
                i = Decimal.pow(k[1], j.pow(k[2])).mul(k[0]);
                break;
            default:
                throw new Error(`upgrade ${this.id} invalid cost type in target: ${this.costD.type}`);
        }
        return i;
    }

    get target() {
        if (ppChal.nu2.depth.gte(c.d1) && this.id === 'norm2') { return D(-1e-12); }
        let i, j, k;

        switch (this.useType) {
            case 0:
                j = anotherGame.points;
                break;
            case 1:
                j = anotherGame.ppEssence.amount;
                break;
            default:
                throw new Error(`upgrade ${this.id} invalid use in target: ${this.useType}`);
        }

        switch (this.costD.type) {
            case 0:
                k = this.costD.main.map((x) => Decimal.log10(x));
                if (k[2].eq(0)) { 
                    return j.max(1).log10().sub(k[0]).div(k[1]);
                }
                i = j.max(1).log10().sub(k[0]).mul(k[2]).mul(c.d4).add(k[1].pow(c.d2)).sqrt().sub(k[1]).div(k[2]).div(c.d2);
                break;
            case 1:
                i = j.div(k[0]).log(k[1]).root(k[2]);
                break;
            default:
                throw new Error(`upgrade ${this.id} invalid cost type in target: ${this.costD.type}`);
        }

        if (this.id === 'norm3') { i = i.mul(ppEUpg[0].effect.up3s); }

        return i
    }

    get effect() {
        let i = this.bought, j, k;
        switch (this.id) {
            case 'norm1':
                i = i.add(normUpg[2].effect.free);
                j = c.d2;
                j = j.add(normUpg[1].effect);
                j = j.mul(normUpg[2].effect.base);
                i = Decimal.pow(j, i);
                break;
            case 'norm2':
                if (ppChal.nu2.depth.gte(c.d1)) {
                    return c.d0;
                }
                j = c.d0_25;
                j = j.add([0.025, 0.055, 0.09, 0.13, 0.175, 0.225, 0.28, 0.34, 0.405, 0.55][anotherGame.ppChal.nu2.completions.sub(c.d1).toNumber()]);
                i = Decimal.mul(j, i);
                if (anotherGame.ppChal.nu2.completions.gte(c.d3)) {
                    i = i.add(1).pow(1.1).sub(1)
                }
                break;
            case 'norm3':
                j = [c.d0_5, D(1.02)];
                if (anotherGame.ppChal.nu2.completions.gte(c.d2)) {
                    i = i.mul(1.2);
                }
                i = {free: Decimal.mul(j[0], i), base: Decimal.pow(j[1], i)};
                break;
            case 'pp1':
                i = {
                    ppe: Decimal.pow(2.2, i.add(c.d1).pow(c.d1_2).log10().add(c.d1).pow(0.9).sub(c.d1).pow10().sub(c.d1)), 
                    up3s: i.add(c.d1).pow(0.7).sub(c.d1).mul(0.03).add(c.d1)
                };
                break;
            case 'pp2':
                if (i.lt(c.d1)) { i = {exp: c.d0, pps: c.d1}; break; }
                j = D(0.15); // less = it slows down less
                i = {
                    exp: i.ln().mul(j).add(1).root(j).mul(0.5),
                    pps: anotherGame.ppEssence.amount.add(1).pow(i.ln().add(1).mul(0.3)).log10().pow(i.ln().mul(0.01).add(1)).pow10()
                };
                break;
            case 'pp3':
            case 'pp4':
            case 'pp5':
            case 'pp6':
            case 'pp7':
            case 'pp8':
            case 'pp9':
            case 'pp10':
            case 'pp11':
                            
                break;
            default:
                throw new Error(`upgrade ${this.id} doesn't exist in effect`);
        }
        return i
    }

    get effectDisplay() {
        let i = ''
        switch (this.id) {
            case 'norm1':
                i = `${format(this.effect)}x point gain`;
                break;
            case 'norm2':
                i = `+${format(this.effect, 2)} UPG1 base`;
                break;
            case 'norm3':
                i = `+${format(this.effect.free, 2)} free UPG1, x${format(this.effect.base, 2)} UPG1 base`;
                break;
            case 'pp1':
                i = `x${format(this.effect.ppe, 2)} PPE, -${formatPerc(this.effect.up3s, 3)} Upgrade 3 scaling`;
                break;
            case 'pp2':
                i = `+${format(this.effect.exp, 2)} PPE exponent, PPE boosts points by x${format(this.effect.pps, 2)}`;
                break;
            case 'pp3':
                i = ``
                break;
            case 'pp4':
            case 'pp5':
            case 'pp6':
            case 'pp7':
            case 'pp8':
            case 'pp9':
            case 'pp10':
            case 'pp11':
                    
                break;
            default:
                throw new Error(`upgrade ${this.id} doesn't exist in effect`);
        }
        return i;
    }
}

class Challenge {
    constructor(id, cap, part, name, txt, goal) {
        this.id = id;
        this.cap = cap;
        this.type = part;
        this.name = name;
        this.desc = txt.desc;
        this.reward = txt.reward;
        this.goal = goal;
    }
    get show() {
        let i = false;
        if (this.id === 'sd') i = true;
        if (this.id === 'nu2') i = anotherGame.pp.gte(c.d10);
        if (this.id === 'ss') i = anotherGame.pp.gte(c.e2);
        return i;
    }
    get depth() {
        let i = c.d0;
        if (anotherGame.ppChal[this.id].in) {
            i = c.d1;
        }
        return i;
    }
}

const ppChal = {
    'sd': new Challenge('sd', c.d1, 0, 'Strengthened Dilation', {
        desc: 'Point dilation is stronger.', 
        reward: 'Point scaling beyond ' + format(c.e10) + ' is weaker.'}, 
        [{type: 'points', amt: c.e10}]),
    'nu2': new Challenge('nu2', c.d10, 1, 'No Upgrade 2', {
        desc: [
            `Upgrade 2 is disabled.`,
            `Upgrade 2 is disabled.`,
            `Upgrade 2 is disabled.`,
            `Upgrade 2 is disabled.`,
            `Upgrade 2 is disabled.`,
            `Upgrade 2 is disabled and Upgrade 1 scales faster.`,
            `Upgrade 2 is disabled and Upgrade 1 scales faster.`,
            `Upgrade 2 is disabled, Upgrade 1 scales faster, and point gain is reduced.`,
            `Upgrade 2 is disabled, Upgrade 1 scales faster, and point gain is reduced.`,
            `Upgrade 2 is disabled, Upgrade 1 scales faster, point gain is reduced, and Upgrade 1's base is weakened.`,
        ], 
        reward: [
            `UP2's base is increased by +${format(0.025, 3)}, and unlock the UPG1 autobuyer.`,
            `UP2's base is increased by +${format(0.03, 3)}, and make Upgrade 3 ${format(20, 3)}% more effective`,
            `UP2's base is increased by +${format(0.035, 3)}, and raise Upgrade 2's effect to the ^${format(1.1, 3)} (unlock 2 & 3 autobuyers)`,
            `UP2's base is increased by +${format(0.04, 3)}, and Upgrade 3's multiplier x${format(1.02, 3)} -> x${format(1.03, 3)}`,
            `UP2's base is increased by +${format(0.045, 3)}, and Upgrade 1 is ${format(15, 3)}% more effective`,
            `UP2's base is increased by +${format(0.05, 3)} and scales ${formatPerc(1.03, 3)} slower`,
            `UP2's base is increased by +${format(0.055, 3)} and scales ${formatPerc(1.05, 3)} slower`,
            `UP2's base is increased by +${format(0.06, 3)}, scales ${formatPerc(1.06, 3)} slower, and UP1's effect is dilated by ^${format(1.01, 3)}`,
            `UP2's base is increased by +${format(0.065, 3)}, scales ${formatPerc(1.07, 3)} slower, and UP1's effect is dilated by ^${format(1.01, 3)}`,
            `UP2's base is increased by +${format(0.145, 3)}, scales ${formatPerc(1.14, 3)} slower, and UP1's effect is dilated by ^${format(1.03, 3)}`, 
        ]}, 
        [
            {type: 'points', amt: c.e6},
            {type: 'points', amt: D(1e8)},
            {type: 'points', amt: c.e10},
            {type: 'points', amt: D(1e12)},
            {type: 'points', amt: D(1e14)},
            {type: 'points', amt: D(1e11)},
            {type: 'points', amt: D(1e14)},
            {type: 'points', amt: D(1e13)},
            {type: 'points', amt: D(1e17)},
            {type: 'points', amt: D(1e15)},
        ]),
    'ss': new Challenge('ss', D(Infinity), 2, 'Super Scaling', {
        desc: "All upgrades scale harsher, and PP's effect is nullified", 
        reward: `UP2's effect is raised to a power > 1.`}, 
        [{type: 'points', amt: D(Infinity)}]),
};

const normUpg = [
    new Upgrade('norm1', 0, c.d10,  {type: 0, main: [c.d10,  c.d2,  D(1.02)]}, 0),
    new Upgrade('norm2', 1, c.e2,   {type: 0, main: [D(250), c.d3,  D(1.01)]}, 0),
    new Upgrade('norm3', 2, D(1e5), {type: 0, main: [c.e6,   c.d10, c.d2]},    0),
];

const ppEUpg = [
    new Upgrade('pp1',  0,  c.d10,   {type: 0, main: [c.d10,   D(10 ** 0.5), D(10 ** 0.0025)]}, 1),
    new Upgrade('pp2',  1,  D(80),   {type: 1, main: [c.e2,    c.d2,   D(1.3)]},    1),
    new Upgrade('pp3',  2,  c.e4,    {type: 0, main: [D(1e5),  c.d10,  c.d1]},      1),
    new Upgrade('pp4',  3,  c.e6,    {type: 1, main: [D(1e7),  c.d5,   D(c.d1_2)]}, 1),
    new Upgrade('pp5',  4,  c.e6,    {type: 0, main: [D(1e8),  c.d1,   c.d2]},      1),
    new Upgrade('pp6',  5,  D(1e9),  {type: 0, main: [c.e10,   c.e2,   D(1.1)]},    1),
    new Upgrade('pp7',  6,  c.e10,   {type: 0, main: [D(1e12), c.e6,   c.d1]},      1),
    new Upgrade('pp8',  7,  D(1e14), {type: 0, main: [D(1e15), c.e4,   c.d3]},      1),
    new Upgrade('pp9',  8,  D(1e20), {type: 0, main: [D(1e20), D(1e5), D(20)]},     1),
    new Upgrade('pp10', 9,  D(1e32), {type: 1, main: [D(1e32), c.e3,   D(2.2)]},    1),
    new Upgrade('pp11', 10, D(1e39), {type: 1, main: [D(1e40), c.e2,   c.d4]},      1),
    
];

function doThing(msg = true) {
    let i, txt;
    initVal('points', c.d0);
    initVal('bestPoints', c.d0);
    initVal('upgs', Array(3).fill(c.d0));
    initVal('pp', c.d0);
    initVal('ppChal', {});
    initVal('ppEssence', {
        exp: c.d2,
        dilate: D(1.4),
        amount: c.d1,
        best: c.d1,
        pps: c.d0,
        upgBought: Array(11).fill(c.d0)
    });

    if (msg) console.log(`<==================== anotherGame ===================>\n`);
    if (anotherGame.pp.gte(c.d10)) {
        i = D(1.4)
        anotherGame.ppEssence.dilate = i
        i = c.d2
        anotherGame.ppEssence.exp = i

        i = c.d2;
        i = i.add(ppEUpg[1].effect.exp);
        i = anotherGame.pp.add(c.d1).mul(c.d2).pow(i).div(c.d2.pow(i));
        i = i.mul(ppEUpg[0].effect.ppe);
        anotherGame.ppEssence.pps = i;

        anotherGame.ppEssence.amount = anotherGame.ppEssence.amount.max(1).pow(anotherGame.ppEssence.exp).log10().pow(anotherGame.ppEssence.dilate).pow10().add(anotherGame.ppEssence.pps).log10().root(anotherGame.ppEssence.dilate).pow10().root(anotherGame.ppEssence.exp);

        anotherGame.ppEssence.best = Decimal.max(anotherGame.ppEssence.amount, anotherGame.ppEssence.best);
        if (msg) console.log(`You have ${format(anotherGame.ppEssence.amount, 3)} PP Essence.`);

        for (i in anotherGame.ppEssence.upgBought) {
            if (anotherGame.ppEssence.amount.lt(ppEUpg[i].initCost)) { continue; }
            if (msg) console.log(`You have ${format(anotherGame.ppEssence.upgBought[i])} PP UPG${parseInt(i)+1}. Effect: ${ppEUpg[i].effectDisplay}. Cost: ${format(ppEUpg[i].cost, 3)} PPE [ buy({ppupg: ${i}}) ]`);
        }
    }

    for (i in ppChal) {
        if (anotherGame.ppChal[i] === undefined) {
            anotherGame.ppChal[i] = {completions: c.d0, best: c.d0, in: false};
        }
    }
    
    anotherGame.PPreq = c.e10;
    anotherGame.PPpending = anotherGame.bestPoints.lt(anotherGame.PPreq) ? c.d0 : anotherGame.bestPoints.log10().add(615).sqrt().mul(c.d10).sub(250).pow10();
    anotherGame.ppEffect = anotherGame.pp.max(0).mul(c.d7).add(c.d1).cbrt().log10().add(c.d1).pow(2/3).sub(c.d1).pow10().sub(c.d1).pow10();

    if (anotherGame.ppChal.nu2.completions.gte(c.d1)) {
        anotherGame.upgs[0] = Decimal.max(anotherGame.upgs[0], normUpg[0].target.add(c.d1).floor());
    }

    if (anotherGame.ppChal.nu2.completions.gte(c.d3)) {
        anotherGame.upgs[1] = Decimal.max(anotherGame.upgs[1], normUpg[1].target.add(c.d1).floor());
        anotherGame.upgs[2] = Decimal.max(anotherGame.upgs[2], normUpg[2].target.add(c.d1).floor());
    }

    anotherGame.pps = c.d1;
    anotherGame.pps = anotherGame.pps.mul(normUpg[0].effect);
    anotherGame.pps = anotherGame.pps.mul(anotherGame.ppEffect);
    anotherGame.pps = anotherGame.pps.mul(ppEUpg[1].effect.pps);
    
    i = {exp: D(c.d1_2), start: c.e10, pow: c.d2, result: c.d0};
    if (ppChal.sd.depth.gte(c.d1)) {
        i.exp = i.exp.mul(Decimal.pow(25/24, ppChal.sd.depth));
    }
    if (anotherGame.ppChal.sd.completions.gte(c.d1)) {
        i.pow = i.pow.pow(0.8);
    }
    i.result = i.start.div(c.d10).log10().add(c.d1).pow(i.exp).pow10();

    anotherGame.prevPoints = anotherGame.points;
    if (anotherGame.points.add(anotherGame.pps).lt(c.d10)) {
        anotherGame.points = anotherGame.points.add(anotherGame.pps);
    } else if (anotherGame.points.add(anotherGame.pps).lt(i.result)) {
        anotherGame.points = anotherGame.points.max(c.d10).log10().pow(i.exp).pow10().add(anotherGame.pps).log10().root(i.exp).pow10();
    } else {
        anotherGame.points = anotherGame.points.log10().pow(i.exp).pow10().max(i.result).div(i.result.pow(Decimal.sub(1, Decimal.div(1, i.pow)))).pow(i.pow).add(anotherGame.pps).root(i.pow).mul(i.result.pow(Decimal.sub(1, Decimal.div(1, i.pow)))).log10().root(i.exp).pow10();
    }

    anotherGame.bestPoints = Decimal.max(anotherGame.bestPoints, anotherGame.points);
    if (msg) console.log(`- You have ${format(anotherGame.points, 3)} points. (${format(anotherGame.points.sub(anotherGame.prevPoints), 3)}/s)`);

    for (i in normUpg) {
        if (msg && normUpg[i].show) console.log(`You have ${format(anotherGame.upgs[i])} Upgrade ${parseInt(i) + 1}. Effect: ${normUpg[i].effectDisplay}. Cost: ${format(normUpg[i].cost)} Points [ buy({upg: ${i}}) ]`);
    }

    if (anotherGame.pp.gt(0)) {
        if (msg) console.log(`- You have ${format(anotherGame.pp, 3)} PP, boosting your point gain by ${format(anotherGame.ppEffect, 3)}x. (+${format(anotherGame.PPpending, 3)}) [ prestigeReset() ]`);
        for (i in ppChal) {
            if (!ppChal[i].show) { break; }
            txt = `${ppChal[i].name}: `;
            switch (ppChal[i].type) {
                case 0:
                case 1:
                    txt += `completed ${format(anotherGame.ppChal[i].completions)} time${anotherGame.ppChal[i].completions.eq(1)?"":"s"} [ challengeToggle(\'${i}\') ]`;
                    if (anotherGame.ppChal[i].completions.lt(ppChal[i].cap)) {
                        if (anotherGame.ppChal[i].in && anotherGame[ppChal[i].goal[anotherGame.ppChal[i].completions.toNumber()].type].gte(ppChal[i].goal[anotherGame.ppChal[i].completions.toNumber()].amt)) {
                            txt += `\n Reached: `;
                        } else {
                            txt += `\n Goal: `;
                        }
                        txt += format(ppChal[i].goal[anotherGame.ppChal[i].completions.toNumber()].amt);
                        txt += " ";
                        txt += ppChal[i].goal[anotherGame.ppChal[i].completions.toNumber()].type;
                    } else {
                        txt += `\n Finished!`
                    }
                    break;
                case 2:
                    txt += `${format(anotherGame.ppChal[i].best)} best ${ppChal[i].goal[0].type}`;
                    break;
                default:
                    throw new Error(`challenge ${i} is baded (type ${ppChal[i].type} not existing)`);
            }
            switch (ppChal[i].type) {
                case 0:
                case 2:
                    txt += `\n ${ppChal[i].desc}`;
                    txt += `\n Reward: ${ppChal[i].reward}`;
                    break;
                case 1:
                    txt += `\n ${ppChal[i].desc[anotherGame.ppChal[i].completions.add(c.d1).min(ppChal[i].desc.length - 1).toNumber()]}`;
                    txt += `\n Reward: ${ppChal[i].reward[anotherGame.ppChal[i].completions.min(ppChal[i].desc.length - 1).toNumber()]}`;
                    break;
                default:
                    throw new Error(`challenge ${i} is baded (type ${ppChal[i].type} not existing)`);
            }
            if (msg) console.log(txt);
        }
    } else {
        if (anotherGame.bestPoints.gte(1e5)) {
            if (anotherGame.bestPoints.gte(anotherGame.PPreq)) {
                if (msg) console.log(`- You are able to gain ${format(anotherGame.PPpending, 3)} PP. [ prestigeReset() ]`);
            } else {
                if (msg) console.log(`- You need ${format(anotherGame.PPreq)} points to prestige.`);
            }
        }
    }

    txt = {txt: `You are in `, if: false};
    for (i in ppChal) {
        if (ppChal[i].depth.gte(c.d1)) {
            txt.txt += `${ppChal[i].name} x${format(ppChal[i].depth, 1)}, `;
            txt.if = true;
        }
    }
    if (msg && txt.if) console.log(txt.txt);
}

function buy(pas) {
    if (pas.upg !== undefined) {
        if (anotherGame.points.gte(normUpg[pas.upg].cost)) {
            if (pas.upg === 2 && !anotherGame.ppChal.sd.completions.gte(c.d1)) {console.warn(`huh?`);}
            anotherGame.points = anotherGame.points.sub(normUpg[pas.upg].cost);
            anotherGame.upgs[pas.upg] = anotherGame.upgs[pas.upg].add(c.d1);
            console.warn("bought");
        } else {
            console.warn(`not enough, you need ${format(anotherGame.points, 3)} points / ${format(normUpg[pas.upg].cost, 3)}`);
        }
    }
    if (pas.ppupg !== undefined) {
        if (anotherGame.ppEssence.amount.gte(ppEUpg[pas.ppupg].cost)) {
            anotherGame.ppEssence.amount = anotherGame.ppEssence.amount.sub(ppEUpg[pas.ppupg].cost);
            anotherGame.ppEssence.upgBought[pas.ppupg] = anotherGame.ppEssence.upgBought[pas.ppupg].add(c.d1);
            console.warn("bought");
        } else {
            console.warn(`not enough, you need ${format(anotherGame.ppEssence.amount, 3)} ${format(anotherGame.ppEssence.amount, 3)} / ${format(ppEUpg[pas.ppupg].cost, 3)}`);
        }
    }
}

function prestigeReset() {
    let i, chal = false;
    for (i in ppChal) {
        if (ppChal[i].depth.gte(c.d1)) {
            chal = true;
        }
    }
    if (chal) {
        throw new Error(`you are in a challenge!`)
    }
    if (anotherGame.bestPoints.gte(anotherGame.PPreq)) {
        anotherGame.pp = anotherGame.pp.add(anotherGame.PPpending);
        anotherGame.points = c.d0;
        anotherGame.bestPoints = c.d0;
        anotherGame.pps = c.d1;
        for (let i in anotherGame.upgs) {
            anotherGame.upgs[i] = c.d0;
        }
    }
}

function challengeToggle(pas) {
    if (!ppChal[pas].show) {
        throw new Error(`you can't enter ${pas} yet!`);
    }
    if (anotherGame.ppChal[pas].in) {
        anotherGame.ppChal[pas].best = Decimal.max(anotherGame.ppChal[pas].best, anotherGame[ppChal[pas].goal[anotherGame.ppChal[pas].completions.min(ppChal[pas].goal.length - 1).toNumber()].type]);
        anotherGame.ppChal[pas].in = false;
        if (anotherGame.ppChal[pas].completions.lt(ppChal[pas].cap) && anotherGame[ppChal[pas].goal[anotherGame.ppChal[pas].completions.min(ppChal[pas].goal.length - 1).toNumber()].type].gte(ppChal[pas].goal[anotherGame.ppChal[pas].completions.min(ppChal[pas].goal.length - 1).toNumber()].amt)) {
            console.log(`you've completed ${ppChal[pas].name} !`);
            anotherGame.ppChal[pas].completions = anotherGame.ppChal[pas].completions.add(c.d1);
        } else {
            console.log(`left challenge ${ppChal[pas].name}`);
        }
    } else {
        anotherGame.ppChal[pas].in = true;
    }
    anotherGame.pp = anotherGame.pp.add(anotherGame.PPpending);
    for (let i = 0; i < 4; i++) {
        doThing(false)
        anotherGame.points = c.d0;
        anotherGame.bestPoints = c.d0;
        anotherGame.pps = c.d1;
        for (let i in anotherGame.upgs) {
            anotherGame.upgs[i] = c.d0;
        }
    }
}