/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Category, SubCategory, Product, Banner } = require('../../../../models')
const { ApiFeatures, ErrorResponse, ImageManipulation } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
const sequelize = require('../../../../config/database')

/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *               @SUBCATEGORIES_CRUD_FUNCTIONALITY
 *  ============================================================
 */
/**
 *	 @desc    gets all subCategories
 *	 @route   GET api/v1/admin/subCategories
 *	 @access  private
 */
exports.getAllSubCategories = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(SubCategory, { limit: 10, ...req.query })
    .filter()
    .getAllItemsOfModel()
  // loops through subCategory and counts active and inActive Products
  for (let i = 0; i < rows.length; i++) {
    let activeCount = await rows[i].countActiveProducts()
    let inActiveCount = await rows[i].countInActiveProducts()
    rows[i] = { ...rows[i].get(), numberOfProducts: { activeCount, inActiveCount } }
  }

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    creates new subCategory
 *	 @route   POST api/v1/admin/subCategories
 *	 @access  private
 */
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.create(req.body)

  res.status(201).json({
    success: true,
    data: subCategory
  })
})
/**
 *	 @desc    get subCategory by id
 *	 @route   GET api/v1/admin/subCategories/:subCategoryId
 *	 @access  private
 */
exports.getSubCategoryById = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params
  // gets with products
  const subCategory = await SubCategory.scope('productsIncluded').findByPk(subCategoryId)

  if (!subCategory)
    return next(new ErrorResponse(`No subcategory found with id ${subCategoryId}`, 404))

  res.status(200).json({
    success: true,
    data: subCategory
  })
})
/**
 *	 @desc    update subCategory by id
 *	 @route   PUT api/v1/admin/subCategories/:subCategoryId
 *	 @access  private
 */
exports.updateSubCategoryById = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params
  // get required subCategory
  const subCategory = await SubCategory.findByPk(subCategoryId)
  if (!subCategory)
    return next(new ErrorResponse(`No subcategory found with id ${subCategoryId}`, 404))

  await subCategory.update(req.body)

  res.status(200).json({
    success: true,
    data: subCategory
  })
})
/**
 *	 @desc    delete subCategory by id
 *	 @route   DELETE api/v1/admin/categories/:categoryId/subCategories/:subCategoryId
 *	 @access  private
 */
exports.deleteSubCategoryById = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params
  // get required subCategory
  const subCategory = await SubCategory.findByPk(subCategoryId)
  if (!subCategory)
    return next(new ErrorResponse(`No subcategory found with id ${subCategoryId}`, 404))

  await subCategory.destroy()

  res.status(204).end()
})
