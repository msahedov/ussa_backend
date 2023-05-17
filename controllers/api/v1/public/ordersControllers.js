/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Order } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fileCope, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
const sequelize = require('../../../../config/database')
/**
 *  ============================================================
 *                   	@PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    get all orders by requested user
 *	 @route   GET api/v1/public/:userId/orders
 *	 @access  private
 */
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(Order, {
    limit: 10,
    sort: '-createdAt',
    ...req.query,
    customerId: req.user.getDataValue('id')
  })
    .getResultWithScopes('simplified')
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get order by id
 *	 @route   GET api/v1/public/:userId/orders/:orderId
 *	 @access  private
 */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params

  const order = await Order.scope('orderedItemsIncluded').findByPk(orderId)
  const state = await req.user.hasOrder(order)
  if (!state) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  res.status(200).json({
    success: true,
    data: order
  })
})
/**
 *	 @desc    update order by id
 *	 @route   PUT api/v1/public/:userId/orders/:orderId
 *	 @access  private
 */
exports.updateOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params

  fieldFilter(req.body, [
    'totalPrice',
    'isPaid',
    'paidAt',
    'delivered',
    'deliveredAt',
    'isSubmitted',
    'customerId'
  ])

  const order = await Order.findByPk(orderId)
  const state = await req.user.hasOrder(order)
  if (!state) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  if (order.getDataValue('isSubmitted'))
    return next(
      new ErrorResponse(
        `Ordered orders cannot be updated, contact with admin to make any changes`,
        400
      )
    )

  await order.update(req.body)

  res.status(200).json({
    success: true,
    data: order
  })
})
/**
 *	 @desc    delete order by id (soft deletion)
 *	 @route   DELETE api/v1/public/:userId/orders/:orderId
 *	 @access  private
 */
exports.deleteOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params
  // get required order
  const order = await Order.findByPk(orderId)
  const state = await req.user.hasOrder(order)
  if (!state) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))
  // soft-deletes
  await order.destroy()

  res.status(204).end()
})
/**
 *	 @desc    create new order
 *	 @route   POST api/v1/public/:userId/orders
 *	 @access  private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { paymentMethod, shippingAddress } = req.body
  let totalPriceOfOrder = 0
  // transactions used to rollback if anything goes wrong
  const result = await sequelize.transaction(async t => {
    // create order
    const order = await Order.create(
      {
        customerId: req.user.getDataValue('id'),
        paymentMethod,
        shippingAddress
      },
      { transaction: t }
    )
    // associating orderItems to order
    // looping throug products from cart
    for (let i = 0; i < req.cartProds.length; i++) {
      const cartProduct = req.cartProds[i]
      // adds and returns what's added to orderItems table
      // need to destructure as it returns array
      const [orderedProduct] = await order.addOrderedProduct(cartProduct, {
        through: { quantity: Number(cartProduct.getDataValue('carts')['quantity']) },
        transaction: t,
        individualHooks: true
      })
      // incrementing totalPriceOfOrder with totalPrice of product (product.price * product.discount * quantity)
      totalPriceOfOrder += Number(orderedProduct.getDataValue('totalPrice'))
    }
    // remove products from cart
    await req.user.removeCartedProducts(req.cartProds)
    return order
  })

  // setting totalPriceOfOrder
  await result.update({ totalPrice: totalPriceOfOrder })

  // TODO: add some logic for paymentResult when payment by credit card is added
  if (result.getDataValue('paymentMethod') === 'byCreditCard') {
  }
  // updating field isSubmitted to true makes order visible to admin
  await result.update({ isSubmitted: true })

  res.status(201).json({
    success: true,
    data: result
  })
})
/**
 *	 @desc    submit order by id
 *	 @route   POST api/v1/public/:userId/orders/:orderId
 *	 @access  private
 */
exports.submitOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params
  // get required order
  const order = await Order.findByPk(orderId)
  const state = await req.user.hasOrder(order)
  if (!state) return next(new ErrorResponse(`No order found with id ${orderId}`, 404))

  if (order.getDataValue('isSubmitted'))
    return next(new ErrorResponse('You already ordered it', 400))

  // if (order.getDataValue('paymentMethod') === 'byCreditCard') {
  //
  // }

  await order.update({ isSubmitted: true })
  res.status(200).json({
    success: true,
    data: order
  })
})
/**
 *  ============================================================
 *                   	@MIDDLEWARES
 *  ============================================================
 */
/**
 *	 @desc    checks if products quantity is not more than available in stock
 *	 @route   POST api/v1/public/:userId/orders
 *	 @access  private
 */
exports.checkIfAvailableInStock = asyncHandler(async (req, res, next) => {
  const cartProds = await req.user.getCartedProducts({ joinTableAttributes: ['quantity'] })
  if (cartProds.length === 0) return next(new ErrorResponse(`You haven't chosen what to buy`, 400))

  for (let i = 0; i < cartProds.length; i++) {
    const product = cartProds[i]
    if (
      !product ||
      Number(product.getDataValue('countInStock')) <
        Number(product.getDataValue('carts')['quantity'])
    )
      return next(new ErrorResponse('Products you are ordering is not available', 400))
  }
  // if * ok then products from cart is written to req.cartProds for next middleware
  req.cartProds = cartProds
  next()
})
