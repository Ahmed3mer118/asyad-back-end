const NodeCache = require("node-cache")

const time = 60 * 5  // 60 * 60 * 2
const cache = new NodeCache({
    stdTTL: time,  // standard to time live 5m * 60s || 
    checkperiod: 120
})

module.exports = cache