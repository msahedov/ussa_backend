const rateLimit = require('express-rate-limit');
const { Attacker } = require('../models');
const blackList = require('./blackList');

async function addAttacker(ip_address) {

  blackList.push(ip_address)
  const attacker = await Attacker.create({ ip_address })
  return attacker;
}


const limitHandler = (limitMax, limitTimeInMinute) => rateLimit({
  max: limitMax,
  windowMs: limitTimeInMinute * 60 * 1000,
  // message: {
  //   success: false,
  //   error: `Too many request from this IP, please try again in ${limitTimeInMinute} minutes later`
  // },
  handler: function (req, res, next) {

    addAttacker(`${req.connection.remoteAddress}`)

    res.status(429).send({
      success: false,
      error: `Too many request from this IP, please try again in ${limitTimeInMinute} minutes later`
    });
  },
});

module.exports = limitHandler;