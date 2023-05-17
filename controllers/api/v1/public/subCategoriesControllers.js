/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { SubCategory } = require('../../../../models')
const { ApiFeatures } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/** ============================================================
 *                       @PUBLIC_CONTROLLERS
 *   ============================================================
 */
/**
 * @desc    gets all subCategories from database
 * @route   GET api/v1/public/subCategories
 * @access  public
 */
exports.getAllSubCategories = asyncHandler(async (req, res, next) => {
  let { count, rows } = await new ApiFeatures(SubCategory, { ...req.query })
    .filter()
    .getAllItemsOfModel()
  // loops and counts number of subCategories
  for (let i = 0; i < rows.length; i++) {
    let activeCount = await rows[i].countActiveProducts()
    rows[i] = { ...rows[i].get(), numberOfProducts: activeCount }
  }

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})

/**
 *	 @desc    get subCategory by id
 *	 @route   GET api/v1/public/subCategories/:subCategoryId
 *	 @access  public
 */
exports.getSubCategoryById = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params
  // gets with product (only partner specific products)
  const subCategory = await SubCategory.scope('activeProductsIncluded').findByPk(subCategoryId)

  if (!subCategory)
    return next(new ErrorResponse(`No subcategory found with id ${subCategoryId}`, 404))

  res.status(200).json({
    success: true,
    data: subCategory
  })
})
