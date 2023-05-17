/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Category, Banner } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all banners from database
 *	 @route   GET api/v1/public/banners
 *	 @access  public
 */
exports.getAllBanners = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(Banner, { limit: 10, ...req.query })
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get banner by id
 *	 @route   GET api/v1/public/banners/:bannerId
 *	 @access  public
 */
exports.getBannerById = asyncHandler(async (req, res, next) => {
  const { bannerId } = req.params

  const banner = await Banner.scope('categoryIncluded').findByPk(bannerId)
  if (!banner) return next(new ErrorResponse(`No banner found with id ${bannerId}`, 404))

  res.status(200).json({
    success: true,
    data: banner
  })
})
