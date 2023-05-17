/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Order } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    get all orders from users
 *	 @route   GET api/v1/admin/orders
 *	 @access  private
 */
exports.getAllUsersOrders = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(Order, {
    limit: 10,
    sort: '-createdAt',
    ...req.query,
    isSubmitted: true,
    paranoid: false
  })
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get order by id
 *	 @route   GET api/v1/admin/orders/:orderId
 *	 @access  private
 */
exports.getUsersOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params

  const order = await Order.scope(
    'customerIncluded',
    'orderedItemsIncluded',
    'submitted',
    'forced'
  ).findByPk(orderId)
  if (!order) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  res.status(200).json({
    success: true,
    data: order
  })
})
/**
 *	 @desc    update order by id
 *	 @route   PUT api/v1/admin/orders/:orderId
 *	 @access  private
 */
exports.updateOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params
  // filtering blacklisted fields
  fieldFilter(req.body, ['totalPrice'])
  // get required order by id
  const order = await Order.scope('submitted', 'forced').findByPk(orderId)
  if (!order) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  await order.update(req.body)

  res.status(200).json({
    success: true,
    data: order
  })
})
/**
 *	 @desc    delete order by id (*forcefully)
 *	 @route   DELETE api/v1/admin/orders/:orderId
 *	 @access  private
 */
exports.deleteOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params
  // get required order by id
  const order = await Order.scope('submitted', 'forced').findByPk(orderId)
  if (!order) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  await order.destroy({ force: true })

  res.status(204).end()
})
