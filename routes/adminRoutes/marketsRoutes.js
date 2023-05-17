const express = require('express')
const {
  getAllMarkets,
  createMarket,
  getMarketById,
  fileUploadValidity,
  deleteMarketById,
  updateMarketById,
  deleteMarketImageByIndex
} = require('../../controllers').api.v1.admin.marketsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const { ADMIN_UPLOAD_IMG_SIZE, ARRAY_UPLOAD_FIELD_NAME, MARKET_UPLOAD_IMG_QTY } =
  require('../../utils').constants

const router = express.Router()

/**
 * @access private
 */

router.use(accessRestriction('admin'))

router
  .route('/')
  .get(getAllMarkets)
  .post(
    multerHandler(ADMIN_UPLOAD_IMG_SIZE).array(ARRAY_UPLOAD_FIELD_NAME, MARKET_UPLOAD_IMG_QTY),
    imageHandler('img/markets', 'market'),
    createMarket
  )
router
  .route('/:marketId')
  .get(getMarketById)
  .put(fileUploadValidity, imageHandler('img/markets', 'market'), updateMarketById)
  .delete(deleteMarketById)

router.put('/:marketId/image/:imageIndex', deleteMarketImageByIndex)

module.exports = router
