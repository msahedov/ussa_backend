/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Market, User } = require('../../../../models')
const {
  ErrorResponse,
  fileCope,
  ImageManipulation,
  fieldFilter,
  constants
} = require('../../../../utils')
const { asyncHandler, multerHandler: multer } = require('../../../../middlewares')
const multerHandler = multer(constants.ADMIN_UPLOAD_IMG_SIZE)
/**
 *  ============================================================
 *                   @PARTNER_CONTROLLERS
 *  ============================================================
 */
/**
 * @desc    gets a market
 * @route   GET api/v1/partner/:partnerId/market
 * @access  private
 */
exports.getMarketById = asyncHandler(async (req, res, next) => {
  const { marketId } = req.params

  const market = await req.user.getMarket({ scope: ['ratingsIncluded'] })
  if (!market) return next(new ErrorResponse(`No market found with id ${marketId}`, 404))

  res.status(200).json({
    success: true,
    data: market
  })
})
/**
 *	 @desc    delete market image by index
 *	 @route   DELETE api/v1/partner/:partnerId/market/image/:imageIndex
 *	 @access  private
 */
exports.deleteMarketImageByIndex = asyncHandler(async (req, res, next) => {
  const { imageIndex } = req.params
  // get required market by id
  const market = await req.user.getMarket()
  if (!market) return next(new ErrorResponse(`Market not found`, 404))
  // check if requested image exits
  let images = market.getDataValue('images')
  if (images.length < imageIndex)
    return next(new ErrorResponse(`No image found with index ${imageIndex}`, 404))
  // delete image from server
  fileCope.deleteFiles(images[imageIndex - 1])
  // delete image from database
  images = images.filter((images, index) => index !== imageIndex - 1)

  // then save it in db
  await market.update({ images })

  // no-content returned
  res.status(204).end()
})
/**
 *  @desc    update a market
 *  @route   PUT api/v1/admin/markets/:marketId
 *  @access  private
 */
exports.updateMarketById = asyncHandler(async (req, res, next) => {
  // if files need to be uploaded then images field updated
  if (req.files && req.files.length > 0) {
    req.body.images = [
      ...req.market.getDataValue('images'),
      ...req.files.map(file => `${file.destination}/${file.filename}`)
    ]
  }
  // every logic passed before (see below)
  await req.market.update(req.body)

  // if everything goes ok then new images are uploaded
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      await new ImageManipulation(req.files[i]).readAndWrite()
    }
  }

  res.status(200).json({
    success: true,
    data: req.market
  })
})
/**
 *  ============================================================
 *                		@CHECKING_MIDDLEWARE
 *  ============================================================
 */
/**
 *	 @desc    multer used inside
 *	 @route   PUT api/v1/partner/market
 *	 @access  private
 */
exports.fileUploadValidity = asyncHandler(async (req, res, next) => {
  // get requested market
  const market = await req.user.getMarket()
  if (!market) return next(new ErrorResponse(`Market not found`, 404))
  // blacklisted fields are filtered
  fieldFilter(req.body, ['rating', 'numRatings', 'ownerId'])
  // gets number of images uploaded before
  const imgQty = market.getDataValue('images').length

  // file upload logic
  multerHandler.array(constants.ARRAY_UPLOAD_FIELD_NAME, constants.MARKET_UPLOAD_IMG_QTY - imgQty)(
    req,
    res,
    async err => {
      if (err) {
        // throws upload error
        return next(new ErrorResponse(`${err}`, 400))
      } else {
        // if no error with uploading, then saves market instance in request body and moves to next middleware
        req.market = market
        next()
      }
    }
  )
})
