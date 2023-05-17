

/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
 const { UsdRate } = require('../../../../models')
 const { ApiFeatures, ErrorResponse} = require('../../../../utils')
 const { asyncHandler } = require('../../../../middlewares')
 /**
  *  ============================================================
  *                   	@ADMIN_CONTROLLERS
  *  ============================================================
  */
 /**
  *	 @desc    gets all usdRates from database
  *	 @route   GET api/v1/admin/rates
  *	 @access  private
  */
 exports.getAllRates = asyncHandler(async (req, res, next) => {
   const { count, rows } = await new ApiFeatures(UsdRate, { limit: 10, ...req.query })
     .filter()
     .getAllItemsOfModel()
 
   res.status(200).set('X-Total-Count', count).json({
     success: true,
     data: rows
   })
 })
 /**
 *	 @desc    get usdRate by id
 *	 @route   GET api/v1/admin/rates/:rateId
 *	 @access  private
 */
exports.getRateById = asyncHandler(async (req, res, next) => {
  const { rateId } = req.params

  const rate = await UsdRate.findByPk(rateId)
  if (!rate) return next(new ErrorResponse(`No rate found with id ${rateId}`, 404))

  res.status(200).json({
    success: true,
    data: rate
  })
})
/**
 *	 @desc    creates a new usdRate
 *	 @route   POST api/v1/admin/rates
 *	 @access  private
 */
 exports.createRate = asyncHandler(async (req, res, next) => {
  const rate = await UsdRate.create(req.body)
  res.status(201).json({
    success: true,
    data: rate
  })
})
/**
 *	 @desc    update usdRate by id
 *	 @route   PUT api/v1/admin/rates/:rateId
 *	 @access  private
 */
 exports.updateRateById = asyncHandler(async (req, res, next) => {
  const { rateId } = req.params
  // get required rate
  const rate = await UsdRate.findByPk(rateId)
  if (!rate) return next(new ErrorResponse(`No rate found with id ${rateId}`, 404))
 
  await rate.update(req.body)

  res.status(200).json({
    success: true,
    data: rate
  })
})
/**
 *	 @desc    delete usdRate by id
 *	 @route   DELETE api/v1/admin/rates/:rateId
 *	 @access  private
 */
 exports.deleteRate = asyncHandler(async (req, res, next) => {
  const { rateId } = req.params
  // get required rate
  const rate = await UsdRate.findByPk(rateId)
  if (!rate) return next(new ErrorResponse(`No rate found with id ${rateId}`, 404))

  await rate.destroy()

  res.status(204).end()
})





