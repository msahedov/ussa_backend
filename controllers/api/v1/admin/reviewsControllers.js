/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Product, Review, OrderItems, User } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all reviewed products
 *	 @route   GET api/v1/admin/reviews
 *	 @access  private
 */
exports.getAllReviewedProducts = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(Review, { limit: 10, ...req.query })
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    gets review by user's and product's ids
 *	 @route   GET api/v1/admin/reviews/products/:productId/users/:userId
 *	 @access  private
 */
exports.getReviewedProductById = asyncHandler(async (req, res, next) => {
  const { userId, productId } = req.params

  const review = await Review.findOne({
    where: {
      userId,
      productId
    }
  })
  if (!review)
    return next(
      new ErrorResponse(`No review found with userId ${userId} and productId ${productId}`, 404)
    )

  res.status(200).json({
    success: true,
    data: review
  })
})
/**
 *	 @desc    approve review by userId and productId
 *	 @route   PUT api/v1/admin/reviews/products/:productId/users/:userId
 *	 @access  private
 */
exports.updateReviewedProductById = asyncHandler(async (req, res, next) => {
  const { userId, productId } = req.params
  // blacklisted fields are ignored
  fieldFilter(req.body, ['rating'])
  // get required review by user and product ids
  const review = await Review.findOne({
    where: {
      userId,
      productId
    }
  })
  if (!review)
    return next(
      new ErrorResponse(`No review found with userId ${userId} and productId ${productId}`, 404)
    )

  await review.update(req.body)

  res.status(200).json({
    success: true,
    data: review
  })
})
