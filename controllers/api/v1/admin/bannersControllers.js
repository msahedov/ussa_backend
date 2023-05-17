/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Category, Banner } = require('../../../../models')
const { ApiFeatures, ErrorResponse, ImageManipulation } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all banners from database
 *	 @route   GET api/v1/admin/banners
 *	 @access  private
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
 *	 @route   GET api/v1/admin/banners/:bannerId
 *	 @access  private
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
/**
 *	 @desc    create banner
 *	 @route   POST api/v1/admin/banners
 *	 @access  private
 */
exports.createBanner = asyncHandler(async (req, res, next) => {
  // file must be provided, but it is still good practice to check, in case that there won't be internall error
  if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

  const banner = await Banner.create(req.body)
  // if * goes ok then new image is uploaded
  if (req.file) await new ImageManipulation(req.file).readAndWrite()

  res.status(201).json({
    success: true,
    data: banner
  })
})
/**
 *	 @desc    update banner by id
 *	 @route   PUT api/v1/admin/banners/:bannerId
 *	 @access  private
 */
exports.updateBannerById = asyncHandler(async (req, res, next) => {
  const { bannerId } = req.params
  // get required banner
  const banner = await Banner.findByPk(bannerId)
  if (!banner) return next(new ErrorResponse(`No banner found with id ${bannerId}`, 404))
  // if file is uploaded then image field name added to db
  if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

  await banner.update(req.body)

  // if * goes ok then new image is uploaded
  if (req.file) await new ImageManipulation(req.file).readAndWrite()

  res.status(200).json({
    success: true,
    data: banner
  })
})
/**
 *	 @desc    delete banner by id
 *	 @route   DELETE api/v1/admin/banners/:bannerId
 *	 @access  private
 */
exports.deleteBanner = asyncHandler(async (req, res, next) => {
  const { bannerId } = req.params
  // get required banner
  const banner = await Banner.findByPk(bannerId)
  if (!banner) return next(new ErrorResponse(`No banner found with id ${bannerId}`, 404))

  await banner.destroy()

  res.status(204).end()
})
