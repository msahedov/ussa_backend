/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Product } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all favorite products
 *	 @route   GET api/v1/public/:userId/favoriteProducts
 *	 @access  private
 */
exports.getFavoriteProducts = asyncHandler(async (req, res, next) => {
  // in constructor pass Product as model even if you only use filter method, because ApiFeatures knows which fields to search by model name
  const { modelOptions: filterObject } = new ApiFeatures(Product, {
    limit: 10,
    ...req.query
  }).filter()

  const count = await req.user.countFavoredProducts(filterObject)
  const rows = await req.user.getFavoredProducts({ ...filterObject, joinTableAttributes: [] })

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get favorite product by id
 *	 @route   GET api/v1/public/:userId/favoriteProducts/:productId
 *	 @access  private
 */
exports.getFavoriteProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get required product by id
  const favoriteProduct = await Product.findByPk(productId)
  const state = await favoriteProduct.hasFavoredUser(req.user)
  if (!state) return next(new ErrorResponse(`No favorite product found with id ${productId}`, 404))

  res.status(200).json({
    success: true,
    data: favoriteProduct
  })
})
/**
 *	 @desc    delete product from favorites
 *	 @route   DELETE api/v1/public/:userId/favoriteProducts/:productId
 *	 @access  private
 */
exports.deleteFavoriteProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params

  // get required product by id
  const favoriteProduct = await Product.findByPk(productId)
  const state = await favoriteProduct.hasFavoredUser(req.user)
  if (!state) return next(new ErrorResponse(`No favorite product found with id ${productId}`, 404))

  await favoriteProduct.removeFavoredUser(req.user)

  res.status(204).end()
})
