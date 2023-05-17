const multer = require('multer')
const { ErrorResponse } = require('../utils')

// ========================================================
//                   MULTER OPTIONS
// ========================================================

const diskStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith('image')
    ? cb(null, true)
    : cb(new ErrorResponse('Only image file!', 400), false)
}

const multerHandler = limitKb =>
  multer({
    storage: diskStorage,
    limits: { fileSize: limitKb * 1024 },
    fileFilter: multerFilter
  })

module.exports = multerHandler
