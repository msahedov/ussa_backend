const express = require('express')
const { getAllReviewedProducts, getReviewedProductById, updateReviewedProductById } =
  require('../../controllers').api.v1.admin.reviewsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()

router.use(accessRestriction('admin'))
/**
 * @access private
 */
router.get('/', getAllReviewedProducts)

router
  .route('/products/:productId/users/:userId')
  .get(getReviewedProductById)
  .put(updateReviewedProductById)

module.exports = router
