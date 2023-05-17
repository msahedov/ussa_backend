const express = require('express')
const {
  getAllOrders,
  getOrderById,
  updateOrderById,
  submitOrderById,
  deleteOrderById,
  createOrder,
  checkIfAvailableInStock
} = require('../../controllers').api.v1.public.ordersControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers

const router = express.Router()

router.use(accessRestriction('user'))
/**
 * @access private
 */
router
  .route('/:userId/orders')
  .get(doubleCheck, getAllOrders)
  .post(doubleCheck, checkIfAvailableInStock, createOrder)

router
  .route('/:userId/orders/:orderId')
  .get(doubleCheck, getOrderById)
  .post(doubleCheck, submitOrderById)
  .put(doubleCheck, updateOrderById)
  .delete(doubleCheck, deleteOrderById)

// TODO: pay order by id after implementing payment api's

// router.post('/:userId/orders/:orderId/submit', authControllers.doubleCheck, ordersControllers.submitOrderById);
module.exports = router
