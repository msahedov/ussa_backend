const express = require('express')
const router = express.Router()
const { getAllUsersOrders, getUsersOrderById, updateOrderById, deleteOrderById } =
  require('../../controllers').api.v1.admin.ordersControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

router.use(accessRestriction('admin'))
/**
 * @access private
 */
router.route('/').get(getAllUsersOrders)

router.route('/:orderId').get(getUsersOrderById).put(updateOrderById).delete(deleteOrderById)

module.exports = router
