/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
 const { Brand, Product } = require('../../../../models')
 const { ApiFeatures, ErrorResponse } = require('../../../../utils')
 const { asyncHandler } = require('../../../../middlewares')
 /**
  *  ============================================================
  *                   	@PARTNER_CONTROLLERS
  *  ============================================================
  */
 /**
  *	 @desc    gets all brands from database
  *	 @route   GET api/v1/:partnerId/brands
  *	 @access  private
  */
 exports.getAllBrands = asyncHandler(async (req, res, next) => {
   const { count, rows } = await new ApiFeatures(Brand, { limit: 10, ...req.query })
     .filter()
     .getAllItemsOfModel()
 
   res.status(200).set('X-Total-Count', count).json({
     success: true,
     data: rows
   })
 })
 /**
  *	 @desc    get brand by id
  *	 @route   GET api/v1/public/brands/:brandId
  *	 @access  public
  */
 exports.getBrandById = asyncHandler(async (req, res, next) => {
   const { brandId } = req.params
  // get required brand
   const brand = await Brand.scope('activeProductsIncluded').findByPk(brandId)
   if (!brand) return next(new ErrorResponse(`No brand found with id ${brandId}`, 404))
 
   res.status(200).json({
     success: true,
     data: brand
   })
 })
