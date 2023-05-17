const express = require('express')
const { getAllOrderedProducts, getOrderById } =
  require('../../controllers').api.v1.partner.ordersControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers

const router = express.Router()

router.use(accessRestriction('partner'))
/**
 * @access private
 */
router.route('/:partnerId/orders').get(doubleCheck, getAllOrderedProducts)

router.route('/:partnerId/orders/:orderId').get(doubleCheck, getOrderById)
//   .put(ordersControllers.markOrderAsDeliveredById)

module.exports = router
