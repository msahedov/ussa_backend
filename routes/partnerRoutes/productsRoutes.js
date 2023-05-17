const express = require('express')
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  deleteProductsImgByIndex,
  fileUploadValidity
} = require('../../controllers').api.v1.partner.productsControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const {
  PARTNER_UPLOAD_IMG_QTY,
  PARTNER_UPLOAD_IMG_SIZE,
  ARRAY_UPLOAD_FIELD_NAME
} = require('../../utils/constants')

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('partner'))

router
  .route('/:partnerId/products')
  .get(doubleCheck, getAllProducts)
  .post(
    doubleCheck,
    multerHandler(PARTNER_UPLOAD_IMG_SIZE).array(ARRAY_UPLOAD_FIELD_NAME, PARTNER_UPLOAD_IMG_QTY),
    imageHandler('img/products/partner/', 'product'),
    createProduct
  )

router
  .route('/:partnerId/products/:productId')
  .get(doubleCheck, getProductById)
  .put(
    doubleCheck,
    fileUploadValidity,
    imageHandler('img/products/partner/', 'product'),
    updateProductById
  )
  .delete(doubleCheck, deleteProductById)

router.put(
  '/:partnerId/products/:productId/image/:imageIndex',
  doubleCheck,
  deleteProductsImgByIndex
)

module.exports = router
