const express = require('express')
const { reviewProductById, checkIfValidProduct } =
  require('../../controllers').api.v1.public.reviewsControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers

const router = express.Router()

router.use(accessRestriction('user'))
/**
 * @access private
 */
router.post('/:userId/reviews/:productId', doubleCheck, checkIfValidProduct, reviewProductById)

module.exports = router
