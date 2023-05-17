const express = require('express')
const {
  getAllProducts,
  getProductById,
  updateProductById,
  createProduct,
  fileUploadValidity,
  deleteProductsImgByIndex,
  deleteProductById,
} = require('../../controllers').api.v1.admin.productsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const { ADMIN_UPLOAD_IMG_QTY, ADMIN_UPLOAD_IMG_SIZE, ARRAY_UPLOAD_FIELD_NAME } =
  require('../../utils').constants

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('admin'))


router
  .route('/')
  .get(getAllProducts)
  .post(
    multerHandler(ADMIN_UPLOAD_IMG_SIZE).array(ARRAY_UPLOAD_FIELD_NAME, ADMIN_UPLOAD_IMG_QTY),
    imageHandler('img/products/admin', 'product'),
    createProduct
  )


router
  .route('/:productId')
  .get(getProductById)
  .put(fileUploadValidity, imageHandler('img/products/admin', 'product'), updateProductById)
  .delete(deleteProductById)

router.put('/:productId/image/:imageIndex', deleteProductsImgByIndex)

module.exports = router
