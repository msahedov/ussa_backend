/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Order } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PARTNER_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    get all orders made from partner's products
 *	 @route   GET api/v1/partner/:partnerId/orders
 *	 @access  private
 */
exports.getAllOrderedProducts = asyncHandler(async (req, res, next) => {
  // first get market of partner
  const market = await req.user.getMarket()
  if (!market) return next(new ErrorResponse('No market found', 404))

  let { count, rows } = await new ApiFeatures(Order, {
    sort: '-createdAt',
    ...req.query,
    isDelivered: true
  })
    .getResultWithScopes('delivered', 'forced', 'simplifiedForPartner', 'orderedItemsIncluded')
    .filter()
    .getAllItemsOfModel()

  // Time complexity: O(n*2) (not including sql query time)
  // Filters from rows
  rows = rows.filter(row => {
    // sets orderedProducts to only partner specific products (*set doesn't save to db unless .save() is used)
    row.set(
      'orderedProducts',
      row.getDataValue('orderedProducts').filter(
        // gets marketId of ordered products and checks whether its equal with partners market
        orderedProduct => orderedProduct.getDataValue('marketId') === market.getDataValue('id')
      )
    ) // at the end checks whether order has no partner specific ordered products
    return row.getDataValue('orderedProducts').length > 0
  })
  // setting filtered rows length to count
  count = rows.length

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get order by id
 *	 @route   GET api/v1/partner/:partnerId/orders/:orderId
 *	 @access  private
 */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params

  // first get market of partner
  const market = await req.user.getMarket()
  if (!market) return next(new ErrorResponse('No market found', 404))
  // get required order
  let order = await Order.scope(
    'delivered',
    'forced',
    'simplifiedForPartner',
    'orderedItemsIncluded',
    'customerIncluded'
  ).findByPk(orderId)
  if (!order) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))
  // check whether order includes partner specific products
  order.set(
    'orderedProducts',
    order
      .getDataValue('orderedProducts')
      .filter(
        orderedProduct => orderedProduct.getDataValue('marketId') === market.getDataValue('id')
      )
  )
  // if order does not include any partner specific products throw error
  if (order.getDataValue('orderedProducts').length === 0)
    return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  res.status(200).json({
    success: true,
    data: order
  })
})
