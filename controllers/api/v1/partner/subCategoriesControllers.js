/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { SubCategory } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PARTNER_CONTROLLERS
 *               @SUBCATEGORIES_CRUD_FUNCTIONALITY
 *  ============================================================
 */
/**
 *	 @desc    gets all subCategories
 *	 @route   GET api/v1/partner/:partnerId/subCategories
 *	 @access  private
 */
exports.getAllSubCategories = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(SubCategory, { limit: 10, ...req.query })
    .filter()
    .getAllItemsOfModel()
  // loops through subCategory and counts active and inActive Products (partner specificc only)
  for (let i = 0; i < rows.length; i++) {
    let activeCount = await rows[i].countActiveProducts({
      where: { creatorId: req.user.getDataValue('id') }
    })
    let inActiveCount = await rows[i].countInActiveProducts({
      where: { creatorId: req.user.getDataValue('id') }
    })
    rows[i] = { ...rows[i].get(), numberOfProducts: { activeCount, inActiveCount } }
  }

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get subCategory by id
 *	 @route   GET api/v1/partner/:partnerId/subCategories/:subCategoryId
 *	 @access  private
 */
exports.getSubCategoryById = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params
  // gets with product (only partner specific products)
  const subCategory = await SubCategory.scope({
    method: ['productsIncludedForSpecificPartner', req.user]
  }).findByPk(subCategoryId)

  if (!subCategory)
    return next(new ErrorResponse(`No subcategory found with id ${subCategoryId}`, 404))

  res.status(200).json({
    success: true,
    data: subCategory
  })
})
