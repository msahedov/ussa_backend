const rateLimit = require('express-rate-limit');
const { addStriker } = require('../controllers/api/v1/admin/strikersControllers');



const limitHandler = (limitMax, limitTimeInMinute) => rateLimit({
  max: limitMax,
  windowMs: limitTimeInMinute * 60 * 1000,
  // message: {
  //   success: false,
  //   error: `Too many request from this IP, please try again in ${limitTimeInMinute} minutes later`
  // },
  handler: function (req, res,/* next*/) {
    //addStriker(req, res, next)
    res.status(429).send({
      success: false,
      error: `Too many request from this IP, please try again in ${limitTimeInMinute} minutes later`
    });
  },
});

module.exports = limitHandler;