const express = require('express')
const { getAllBanners, getBannerById, createBanner, updateBannerById, deleteBanner } =
  require('../../controllers').api.v1.admin.bannersControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const { BANNER_UPLOAD_IMG_SIZE, SINGLE_UPLOAD_FIELD_NAME } = require('../../utils').constants

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('admin'))

router
  .route('/')
  .get(getAllBanners)
  .post(
    multerHandler(BANNER_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/banners', 'banner'),
    createBanner
  )

router
  .route('/:bannerId')
  .get(getBannerById)
  .put(
    multerHandler(BANNER_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/banners', 'banner'),
    updateBannerById
  )
  .delete(deleteBanner)

module.exports = router
