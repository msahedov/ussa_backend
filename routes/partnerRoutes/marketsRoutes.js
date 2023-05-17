const express = require('express')
const { getMarketById, deleteMarketImageByIndex, fileUploadValidity, updateMarketById } =
  require('../../controllers').api.v1.partner.marketsControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers
const { imageHandler } = require('../../middlewares')

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('partner'))
router
  .route('/:partnerId/market')
  .get(doubleCheck, getMarketById)
  .put(doubleCheck, fileUploadValidity, imageHandler('img/markets', 'market'), updateMarketById)

router.put('/:partnerId/market/images/:imageIndex', doubleCheck, deleteMarketImageByIndex)

module.exports = router
