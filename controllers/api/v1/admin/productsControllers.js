/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Product, User, SearchTerm, usdRate } = require('../../../../models')
const {
  ApiFeatures,
  ErrorResponse,
  ImageManipulation,
  fileCope,
  fieldFilter,
  constants
} = require('../../../../utils')
const { asyncHandler, multerHandler: multer } = require('../../../../middlewares')
const multerHandler = multer(constants.ADMIN_UPLOAD_IMG_SIZE)
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all products from database
 *	 @route   GET api/v1/admin/products
 *	 @access  private
 */
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  // to get deleted products write in query ?paranoid=false&deletedAt[ne]=null
  const { count, rows } = await new ApiFeatures(Product, { limit: 10, ...req.query })
    .getResultWithScopes('simplified')
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    gets a product by id
 *	 @route   GET api/v1/admin/products/:productId
 *	 @access  private
 */
exports.getProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params

  const product = await Product.scope('marketIncluded').findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))

  res.status(200).json({
    success: true,
    data: product
  })
})
/**
 *	 @desc    updates product by id
 *	 @route   PUT api/v1/admin/products/:productId
 *	 @access  private
 */
exports.updateProductById = asyncHandler(async (req, res, next) => {
  // if files need to be uploaded then images field updated
  if (req.files && req.files.length > 0) {
    req.body.images = [
      ...req.product.getDataValue('images'),
      ...req.files.map(file => `${file.destination}/${file.filename}`)
    ]
  }
  // every logic passed before (see below)
  await req.product.update(req.body)

  // if everything goes ok then new images are uploaded
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      await new ImageManipulation(req.files[i]).readAndWrite()
    }
  }

  res.status(200).json({
    success: true,
    data: req.product
  })
})
/**
 *	 @desc    creates a new product
 *	 @route   POST api/v1/admin/products
 *	 @access  private
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  // black listed fields are filtered
  fieldFilter(req.body, ['rating', 'numReviews', 'likeCount', 'viewCount'])
  // if files are present then image name is saved to db
  if (req.files && req.files.length > 0)
    req.body.images = req.files.map(file => `${file.destination}/${file.filename}`)
  // creatorId can be specified
  const product = await Product.create(req.body)

  // if everything goes ok then new images are uploaded
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      await new ImageManipulation(req.files[i]).readAndWrite()
    }
  }

  res.status(201).json({
    success: true,
    data: product
  })
})
/**
 *	 @desc    deletes product by id
 *	 @route   DELETE api/v1/admin/products/:productId
 *	 @access  private
 */
exports.deleteProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get required product by id
  const product = await Product.findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))

  await product.destroy()

  // no-content is returned
  res.status(204).end()
})
/**
 *	 @desc    deletes product image by id
 *	 @route   DELETE api/v1/admin/products/:productId/image/:imageIndex
 *	 @access  private
 */
exports.deleteProductsImgByIndex = asyncHandler(async (req, res, next) => {
  const { productId, imageIndex } = req.params
  // get required product by id
  const product = await Product.findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // check if requested image exists
  let images = product.getDataValue('images')
  if (images.length < imageIndex)
    return next(new ErrorResponse(`No image found with index ${imageIndex}`, 404))
  // delete image from server
  fileCope.deleteFiles(images[imageIndex - 1])
  // delete image from db
  images = images.filter((image, index) => index !== imageIndex - 1)

  // then save it in db
  await product.update({ images })
  // no-content returned
  res.status(204).end()
})
/**
 *  ============================================================
 *                		@CHECKING_MIDDLEWARE
 *  ============================================================
 */
/**
 *	 @desc    multer used inside
 *	 @route   PUT api/v1/admin/products/:productId
 *	 @access  private
 */
exports.fileUploadValidity = asyncHandler(async (req, res, next) => {
  const { productId } = req.params
  // get requested product
  const product = await Product.findByPk(productId)
  if (!product) return next(new ErrorResponse(`No product found with id ${productId}`, 404))
  // blacklisted fields are filtered
  fieldFilter(req.body, ['rating', 'numReviews', 'likeCount', 'viewCount'])
  // gets number of images uploaded before
  const imgQty = product.getDataValue('images').length

  // file upload logic
  multerHandler.array(constants.ARRAY_UPLOAD_FIELD_NAME, constants.ADMIN_UPLOAD_IMG_QTY - imgQty)(
    req,
    res,
    async err => {
      if (err) {
        // throws upload error
        return next(new ErrorResponse(`${err}`, 400))
      } else {
        // if no error with upload saves product instance in request body and moves to next middleware
        req.product = product
        next()
      }
    }
  )
})
