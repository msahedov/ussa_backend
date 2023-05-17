const express = require('express')
const { getAllReviewedProducts, getReviewedProductById } =
  require('../../controllers').api.v1.partner.reviewsControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers

const router = express.Router()

router.use(accessRestriction('partner'))
/**
 * @access private
 */
router.get('/:partnerId/reviews', doubleCheck, getAllReviewedProducts)
router.get(
  '/:partnerId/reviews/products/:productId/users/:userId',
  doubleCheck,
  getReviewedProductById
)

module.exports = router
