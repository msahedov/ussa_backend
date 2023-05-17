const express = require('express')
const { getAllBrands, getBrandById } =
  require('../../controllers').api.v1.partner.brandsControllers
const { doubleCheck, accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()
/**
 * @access private
 */
router.use(accessRestriction('partner'))

router.get('/:partnerId/brands',doubleCheck, getAllBrands)
router.get('/:partnerId/brands/:brandId',doubleCheck, getBrandById)

module.exports = router
