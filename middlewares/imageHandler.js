const { v4: uuidv4 } = require('uuid');

// ========================================================
//                   ImageHandler OPTIONS
// ========================================================

const imageHandler = (fileUrl, fileName) => (req, res, next) => {
  // setting neccesary fields to req.file object in order to upload
  if (req.file) {
    req.file.filename = `${fileName}-${uuidv4()}.jpeg`;
    req.file.destination = `/${fileUrl}`;
  };

  if (req.files) {
    req.files.forEach(file => {
      file.filename = `${fileName}-${uuidv4()}.jpeg`;
      file.destination = `/${fileUrl}`;
    })
  };

  next();
}
module.exports = imageHandler;