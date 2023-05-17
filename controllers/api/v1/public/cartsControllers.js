/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Product, User } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fileCope } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
const sequelize = require('../../../../config/database')
const { QueryTypes } = require('sequelize')
/**
 *  ============================================================
 *                   	@PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    get products from cart
 *	 @route   POST api/v1/public/:userId/carts
 *	 @access  private
 */
exports.getCartProducts = asyncHandler(async (req, res, next) => {
  const cartProds = await req.user.getCartedProducts({
    scope: 'simplified',
    joinTableAttributes: ['quantity', 'createdAt']
  })
  const model = User
  for (let assoc of Object.keys(model.associations)) {
    for (let accessor of Object.keys(model.associations[assoc].accessors)) {
      console.log(model.name + '.' + model.associations[assoc].accessors[accessor] + '()')
    }
  }

  res.status(200).json({
    success: true,
    data: cartProds
  })
})
/**
 *	 @desc    get products from cart by id
 *	 @route   POST api/v1/public/:userId/carts/:productId
 *	 @access  private
 */
exports.getCartProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // as in many-to-many association you cannot get only one row, so we taking first row of returned array
  const product = (
    await req.user.getCartedProducts({
      where: { id: productId },
      joinTableAttributes: ['quantity']
    })
  )[0]

  res.status(200).json({
    success: true,
    data: product
  })
})
/**
 *	 @desc    add product to cart by id
 *	 @route   POST api/v1/public/:userId/carts/:productId/add
 *	 @access  private
 */
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  const { quantity } = req.body
  // get required product by id
  const product = await Product.scope('actives').findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // add to cart
  await req.user.addCartedProduct(product, { through: { quantity } })

  res.status(204).end()
})
/**
 *	 @desc    remove product from cart by id
 *	 @route   DELETE api/v1/public/:userId/carts/:productId/remove
 *	 @access  private
 */
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get required product by id
  const product = await Product.findByPk(productId)
  const state = await req.user.hasCartedProduct(product)
  if (!state) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // remove from cart
  await req.user.removeCartedProduct(product)

  res.status(204).end()
})
/**
 *	 @desc    empty cart of requested user
 *	 @route   DELETE api/v1/public/:userId/carts
 *	 @access  private
 */
exports.emptyCartByUserId = asyncHandler(async (req, res, next) => {
  const productsInCart = await req.user.getCartedProducts()
  // empty cart
  await req.user.removeCartedProducts(productsInCart)

  res.status(204).end()
})
