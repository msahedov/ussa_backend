/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
 const { Brand, Product } = require('../../../../models')
 const { ApiFeatures, ErrorResponse, ImageManipulation } = require('../../../../utils')
 const { asyncHandler } = require('../../../../middlewares')
 /**
  *  ============================================================
  *                   	@ADMIN_CONTROLLERS
  *  ============================================================
  */
 /**
  *	 @desc    gets all brands from database
  *	 @route   GET api/v1/admin/brands
  *	 @access  private
  */
 exports.getAllBrands = asyncHandler(async (req, res, next) => {
   const { count, rows } = await new ApiFeatures(Brand, { limit: 10, ...req.query })
     .getResultWithScopes('simplified')
     .filter()
     .getAllItemsOfModel()

   res.status(200).set('X-Total-Count', count).json({
     success: true,
     data: rows
   })
 })
 /**
  *	 @desc    get brand by id
  *	 @route   GET api/v1/admin/brands/:brandId
  *	 @access  private
  */
 exports.getBrandById = asyncHandler(async (req, res, next) => {
   const { brandId } = req.params
   // get required brand
   const brand = await Brand.scope('productsIncluded').findByPk(brandId)
   if (!brand) return next(new ErrorResponse(`No brand found with id ${brandId}`, 404))

   res.status(200).json({
     success: true,
     data: brand
   })
 })
 /**
  *	 @desc    create brand
  *	 @route   POST api/v1/admin/brand
  *	 @access  private
  */
 exports.createBrand = asyncHandler(async (req, res, next) => {
   // file must be provided, but it is still good practice to check, in case that there won't be internall error
   if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

   const brand = await Brand.create(req.body)
   // if * goes ok then new image is uploaded
   if (req.file) await new ImageManipulation(req.file).readAndWrite()

   res.status(201).json({
     success: true,
     data: brand
   })
 })
 /**
  *	 @desc    update brand by id
  *	 @route   PUT api/v1/admin/brands/:brandId
  *	 @access  private
  */
 exports.updateBrandById = asyncHandler(async (req, res, next) => {
   const { brandId } = req.params
   // get required brand
   const brand = await Brand.findByPk(brandId)
   if (!brand) return next(new ErrorResponse(`No brand found with id ${brandId}`, 404))
   // if file is uploaded then image field name added to db
   if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

   await brand.update(req.body)

   // if * goes ok then new image is uploaded
   if (req.file) await new ImageManipulation(req.file).readAndWrite()

   res.status(200).json({
     success: true,
     data: brand
   })
 })
 /**
  *	 @desc    delete brand by id
  *	 @route   DELETE api/v1/admin/brands/:brandId
  *	 @access  private
  */
 exports.deleteBrand = asyncHandler(async (req, res, next) => {
   const { brandId } = req.params
   // get required brand
   const brand = await Brand.findByPk(brandId)
   if (!brand) return next(new ErrorResponse(`No brand found with id ${brandId}`, 404))

   await brand.destroy()

   res.status(204).end()
 })
