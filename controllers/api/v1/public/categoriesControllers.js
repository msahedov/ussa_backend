/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Category } = require('../../../../models')
const { ApiFeatures , ErrorResponse} = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/** ============================================================
 *                       @PUBLIC_CONTROLLERS
 *   ============================================================
 */
/**
 * @desc    gets all categories from database
 * @route   GET api/v1/public/categories
 * @access  public
 */
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  let { count, rows } = await new ApiFeatures(Category, { ...req.query })
    .getResultWithScopes()
    .filter()
    .getAllItemsOfModel()
  // loops and counts number of subCategories
  for (let i = 0; i < rows.length; i++) {
    let numberOfSubCategories = await rows[i].countSubCategories()
    let numberOfBanners = await rows[i].countBanners()
    rows[i] = { ...rows[i].get(), numberOfSubCategories, numberOfBanners }
  }

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})

/**
 * @desc    get category by id
 * @route   api/v1/public/categories/:categoryId
 * @access  public
 */
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params
  // get required category
  const category = await Category.scope('subCategoryIncluded', 'bannerIncluded').findByPk(
    categoryId
  )
  if (!category) return next(new ErrorResponse(`No category found with id ${categoryId}`, 404))

  res.status(200).json({
    success: true,
    data: category
  })
})
