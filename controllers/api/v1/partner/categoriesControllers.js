/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Category } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/** ============================================================
 *                       @PARTNER_CONTROLLERS
 *                    @CATEGORIES_CRUD_FUNCTIONALITY
 *   ============================================================
 */
/**
 * @desc    gets all categories from database
 * @route   api/v1/partner/:partnerId/categories
 * @access  private
 */
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  let { count, rows } = await new ApiFeatures(Category, { ...req.query })
    .getResultWithScopes()
    .filter()
    .getAllItemsOfModel()
  // loops and counts number of subCategories
  for (let i = 0; i < rows.length; i++) {
    let numberOfSubCategories = await rows[i].countSubCategories()
    rows[i] = { ...rows[i].get(), numberOfSubCategories }
  }

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    // result: count
    data: rows
  })
})

/**
 * @desc    get category by id
 * @route   api/v1/partner/:partnerId/categories/:categoryId
 * @access  private
 */
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params
  // get required category
  const category = await Category.scope('subCategoryIncluded').findByPk(categoryId)
  if (!category) return next(new ErrorResponse(`No category found with id ${categoryId}`, 404))
  // const banners = await category.getBanners({ joinTableAttributes: [] })

  res.status(200).json({
    success: true,
    data: category
  })
})
