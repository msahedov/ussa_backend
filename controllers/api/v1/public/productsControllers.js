/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { QueryTypes, where } = require('sequelize')
const { Product, SearchTerm, User, Order, Category, usdRate } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fileCope } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
const sequelize = require('../../../../config/database')
/**
 *  ============================================================
 *                   @PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all active products
 *	 @route   GET api/v1/public/products
 *	 @access  public
 */
exports.getAllActiveProducts = asyncHandler(async (req, res, next) => {
  // gets products from actives and in simplified structure
  const { count, rows } = await new ApiFeatures(Product, {
    limit: 10,
    ...req.query,
    active: true
  })
    .getResultWithScopes('actives', 'simplified')
    .filter()
    .getAllItemsOfModel()

  // if result has gotten from search then its added to searchterms table
  if (req.query.q && req.query.q.length > 0) {
    const [searchTerm] = await SearchTerm.findOrCreate({ where: { term: req.query.q } })
    searchTerm.addSearchCount()
    await searchTerm.save()
  }
  // const model = Category
  // for (let assoc of Object.keys(model.associations)) {
  //   for (let accessor of Object.keys(model.associations[assoc].accessors)) {
  //     console.log(model.name + '.' + model.associations[assoc].accessors[accessor] + '()')
  //   }
  // }
  // return number of results in header
  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    gets all active products
 *	 @route   GET api/v1/public/products
 *	 @access  private
 */
exports.getAllActiveProductsForAuthoredUser = asyncHandler(async (req, res, next) => {
  // gets products from actives and in simplified structure
  let { count, rows } = await new ApiFeatures(Product, {
    limit: 10,
    ...req.query,
    active: true
  })
    .getResultWithScopes('actives', 'simplified')
    .filter()
    .getAllItemsOfModel()

  // loops and counts number of subCategories, checks whether product is favored and in cart
  for (let i = 0; i < rows.length; i++) {
    // checks if requesting user favored this product
    const favored = await rows[i].hasFavoredUser(req.user)
    // checks if this product in cart
    const hasInCart = await rows[i].hasCartedUser(req.user)
    // by default quantity in cart of this product is 0
    let quantityInCart = 0
    // if product exists in cart of requested user then it returns number of products in cart
    if (hasInCart) {
      // since you cannot query usual methods to junc table, we use sql query
      // it returns array so we take first row, and inside of row we take value of 'quantity key'
      const cart = (
        await sequelize.query(
          `SELECT "quantity" FROM "carts" WHERE ("carts"."productId"=${rows[i].getDataValue(
            'id'
          )} AND "carts"."userId"=${req.user.getDataValue('id')})`,
          { type: QueryTypes.SELECT }
        )
      )[0]['quantity']
      // returns string, so we convert it to number
      quantityInCart = Number(cart)
    }
    rows[i] = { ...rows[i].get(), favored, quantityInCart }
  }
  // if result has gotten from search then its added to searchterms table
  if (req.query.q && req.query.q.length > 0) {
    const [searchTerm] = await SearchTerm.findOrCreate({ where: { term: req.query.q } })
    searchTerm.addSearchCount()
    await searchTerm.save()
  }
  // return number of results in header
  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    gets active product by id with similar products to it
 *	 @route   GET api/v1/public/products/:productId
 *	 @access  public
 */
exports.getActiveProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get required product
  const product = await Product.scope(
    'actives',
    'marketIncluded',
    'approvedReviewsIncluded'
  ).findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // if it exist then add view count
  product.addViewCount()
  await product.save()
  // get along product similar products to it gets with limit=10
  const similarProducts = await Product.scope('actives', {
    method: ['similarProducts', product]
  }).findAll({ limit: 10 })

  res.status(200).json({
    success: true,
    data: {
      product,
      similarProducts
    }
  })
})
/**
 *	 @desc    adds active product to favorites
 *	 @route   POST api/v1/public/products/:productId
 *	 @access  private
 */
exports.addToFavorites = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get required product
  const product = await Product.scope('actives').findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // get state whether this product already favored before
  const state = await product.hasFavoredUser(req.user)
  if (state)
    return next(new ErrorResponse(`Product with id ${productId} already in your favorites`, 400))
  // if * ok, then its added to favorites
  await product.addFavoredUser(req.user)
  // no-content returned
  res.status(204).end()
})
/**
 *	 @desc    like active product by id
 *	 @route   POST api/v1/public/products/:productId/like
 *	 @access  private
 */
exports.likeProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get required product
  const product = await Product.scope('actives').findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // get state whether this product already liked before
  const state = await product.hasLikedUser(req.user)
  if (state) return next(new ErrorResponse(`Product with id ${productId} already was liked`, 400))
  // if * ok, then its liked
  product.addLikedUser(req.user)
  // add +1 like to product
  product.addLikeCount()
  await product.save()
  // no-content returned
  res.status(204).end()
})
