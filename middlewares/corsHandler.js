const cors = require('cors');
const ErrorResponse = require('../utils/errorResponse');

// ========================================================
//                   CORS OPTIONS
// ========================================================
const whitelist = ['::ffff:127.0.0.1',]
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  console.log(req.connection.remoteAddress)
  if (whitelist.indexOf(req.connection.remoteAddress) !== -1) {
    corsOptions = { origin: false } // disable CORS for this request
    callback(new ErrorResponse('Your IP address not allowed to have access to this route', 403), corsOptions);

  } else {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    callback(null, corsOptions) // callback expects two parameters: error and options
  }
  // callback(null, corsOptions) // callback expects two parameters: error and options
}

const corsHandler = () => cors(corsOptionsDelegate);

module.exports = corsHandler;
