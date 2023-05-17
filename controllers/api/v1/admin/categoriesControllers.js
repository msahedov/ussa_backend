/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Category } = require('../../../../models')
const { ApiFeatures, ErrorResponse, ImageManipulation } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *               @CATEGORIES_CRUD_FUNCTIONALITY
 *  ============================================================
 */
/**
 *	 @desc    gets all categories from database
 *	 @route   GET api/v1/admin/categories
 *	 @access  private
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
 *	 @desc    get category by id
 *	 @route   GET api/v1/admin/categories/:categoryId
 *	 @access  private
 */
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params
  // get required category
  const category = await Category.scope('subCategoryIncluded', 'bannerIncluded').findByPk(
    categoryId
  )
  if (!category) return next(new ErrorResponse(`No category found with id ${categoryId}`, 404))
  // const banners = await category.getBanners({ joinTableAttributes: [] })

  res.status(200).json({
    success: true,
    data: category
  })
})
/**
 *	 @desc    update category by id
 *	 @route   PUT api/v1/admin/categories/:categoryId
 *	 @access  private
 */
exports.updateCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params
  // get required category
  const category = await Category.findByPk(categoryId)
  if (!category) return next(new ErrorResponse(`No category found with id ${categoryId}`, 404))
  // if file is uploaded then image field name added to db
  if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

  await category.update(req.body)

  // if * goes ok then new image is uploaded
  if (req.file) await new ImageManipulation(req.file).readAndWrite()

  res.status(200).json({
    success: true,
    data: category
  })
})
/**
 *	 @desc    create new category
 *	 @route   POST api/v1/admin/categories
 *	 @access  private
 */
exports.createCategory = asyncHandler(async (req, res, next) => {
  // if file is uploaded then image field name added to db
  if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

  const category = await Category.create(req.body)
  // if * goes ok then new image is uploaded
  if (req.file) await new ImageManipulation(req.file).readAndWrite()

  res.status(201).json({
    success: true,
    data: category
  })
})
/**
 *	 @desc    delete category by id
 *	 @route   DELETE api/v1/admin/categories/:categoryId
 *	 @access  private
 */
exports.deleteCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params
  // get required category
  const category = await Category.findByPk(categoryId)
  if (!category) return next(new ErrorResponse(`No category found with id ${categoryId}`, 404))

  await category.destroy()

  res.status(204).end()
})
/**
 *	 @desc    delete category image by id
 *	 @route   DELETE api/v1/admin/categories/:categoryId/deleteImage
 *	 @access  private
 */
exports.deleteCategoryImageById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params
  // get required category
  const category = await Category.findByPk(categoryId)
  if (!category) return next(new ErrorResponse(`No category found with id ${categoryId}`, 404))

  await category.update({ image: null })

  res.status(204).end()
})
