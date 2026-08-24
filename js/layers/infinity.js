"use strict";

addLayer('i', {
    name: "infinity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: '∞', // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row: 1, // Row the layer is in on the tree (0 is the first row)
	branches: ['p'],
    hotkeys: [
        {key: 'i', description: "I: Reset for infinity points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){ return hasChallenge('q', 14) || Decimal.gt(player[this.layer].best, 0) },
    startData() { return {
        unlocked: false,
        points: D(0),
        bestPointsInI: D(0),
        timeInI: D(0),
    }},
    color: "#ffff00",
    requires: D('e9e15'), // Can be a function that takes requirement increases into account
    resource: "infinity points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() { return player.points }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    update(diff) {
        player[this.layer].timeInI = player[this.layer].timeInI.add(player.globalTS.mul(diff))
    },
    effect(){
        let i = D(1)
        return i
    },
    effectDescription(){
        return ` lorem ipsum &times;${format(tmp[this.layer].effect, 2)}.`
    },
    getRequire() {
        let i = new Decimal('e9e15')
        return i
    },
    canReset() {
        let req = tmp[this.layer].getRequire
        return player.points.gte(req)
    },
    getResetGain() {
        let req = tmp[this.layer].getRequire.log10()
        let i = player.points.lt(req) 
            ? D(0) 
            : player.points.log10().log(req).sub(1).pow_base(1000)
        return i
    },
    getNextAt() {
        let i = tmp[this.layer].getResetGain

        let req = tmp[this.layer].getRequire.log10()
        i = i.add(1).floor().log(1000).add(1).pow_base(req).pow10()
        return i
    },
    prestigeButtonText(){
        let gain = tmp[this.layer].getResetGain
        let nextAt = tmp[this.layer].getNextAt

        let amt = "You can reset for " + format(gain) + " Infinity Points"
        let nxt = ""
        if (gain.lt(1000)) nxt = "<br> You need " + format(nextAt) + " Points for the next"

        return amt + nxt
    },
    doReset(isInside) {
        tmp.q.doReset(false)
    }
})