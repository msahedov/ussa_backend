const express = require('express')
const { getAllBrands, getBrandById } =
  require('../../controllers').api.v1.public.brandsControllers
 
const router = express.Router()


/**
 * @access public
 */
router.get('/', getAllBrands)
router.get('/:brandId', getBrandById)

module.exports = router
