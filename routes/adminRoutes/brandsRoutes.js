const express = require('express')
const { getAllBrands, createBrand , getBrandById, updateBrandById , deleteBrand} =
  require('../../controllers').api.v1.admin.brandsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const { BRAND_UPLOAD_IMG_SIZE, SINGLE_UPLOAD_FIELD_NAME } = require('../../utils').constants

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('admin'))

router
  .route('/')
  .get(getAllBrands)
  .post(
    multerHandler(BRAND_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/brands', 'brand'),
    createBrand
  )

router
  .route('/:brandId')
  .get(getBrandById)
  .put(
    multerHandler(BRAND_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/brands', 'brand'),
    updateBrandById
  )
   .delete(deleteBrand)

module.exports = router
