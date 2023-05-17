const express = require('express')
const { getAllBanners, getBannerById } =
  require('../../controllers').api.v1.public.bannersControllers

const router = express.Router()
/**
 * @access public
 */
router.get('/', getAllBanners)
router.get('/:bannerId', getBannerById)

module.exports = router
