/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Product } = require('../../../../models')
const { ErrorResponse, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    review product by id
 *	 @route   POST api/v1/public/:userId/reviews/:productId
 *	 @access  private
 */
exports.reviewProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // filter blacklisted fields
  fieldFilter(req.body, ['approvedByAdmin'])
  // get required product
  const product = await Product.scope('actives').findByPk(productId)
  // check whether product was rated with this user before
  const state = await req.user.hasReviewedProduct(product)
  if (state)
    return next(new ErrorResponse(`You already reviewed product with id ${productId}`, 400))

  await product.addReviewedUser(req.user, {
    through: { ...req.body, rating: req.body.rating.toFixed(2) }
  })
  product.addNumReview()
  await product.save()
  product.calcAverageRate(req.body.rating.toFixed(2))
  await product.save()

  res.status(200).json({
    success: true,
    data: product
  })
})
/**
 *  ============================================================
 *                   	@MIDDLEWARE
 *  ============================================================
 */
/**
 *	 @desc    checks if product was bougt by user
 *	 @route   can be used anywhere (POST api/v1/public/:userId/reviews/:productId)
 *	 @access  private
 */
exports.checkIfValidProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // gets all orders where productId specified products were purchased by requesting user
  // returns empty array if user hasn't purchased specified product
  const orders = await req.user.getOrders({
    scope: [
      'submitted',
      'delivered',
      { method: ['orderedItemsIncludedWithSpecificProductId', productId] }
    ]
  })

  if (orders.length === 0)
    return next(new ErrorResponse(`You have not purchased product with id ${productId}`, 400))
  next()
})
