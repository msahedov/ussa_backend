/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Product, Review, OrderItems, User } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PARTNER_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all reviewed products
 *	 @route   GET api/v1/partner/:partnerId/reviews
 *	 @access  private
 */
exports.getAllReviewedProducts = asyncHandler(async (req, res, next) => {
  // first get market of partner
  const market = await req.user.getMarket()
  if (!market) return next(new ErrorResponse('No market found', 404))

  let { count, rows } = await new ApiFeatures(Review, {
    limit: 10,
    ...req.query,
    approvedByAdmin: true
  })
    .getResultWithScopes('approved', 'productIncluded')
    .filter()
    .getAllItemsOfModel()
  // loops then decides whether product belongs to partner's market
  rows = rows.filter(row => {
    if (row.getDataValue('product').getDataValue('marketId') === market.getDataValue('id')) {
      // sets product to null
      row.set('product', null)
      return row
    }
  })

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    gets review by user's and product's ids
 *	 @route   GET api/v1/partner/reviews/product/:productId/user/:userId
 *	 @access  private
 */
exports.getReviewedProductById = asyncHandler(async (req, res, next) => {
  const { userId, productId } = req.params
  // first get market of partner
  const market = await req.user.getMarket()
  if (!market) return next(new ErrorResponse('No market found', 404))

  let review = await Review.scope('productIncluded').findOne({
    where: {
      userId,
      productId
    }
  })
  if (!review)
    return next(
      new ErrorResponse(`No review found with userId ${userId} and productId ${productId}`, 404)
    )
  // loops then decides whether product belongs to partner's market
  const state = await market.hasProduct(review.getDataValue('product'))
  if (!state) return next(new ErrorResponse(`You are not authrozied to access this route`, 403))
  // if * goes ok then value of product set to null
  review.set('product', null)
  res.status(200).json({
    success: true,
    data: review
  })
})
