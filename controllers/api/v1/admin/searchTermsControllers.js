/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { SearchTerm } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all searched terms from database
 *	 @route   GET api/v1/admin/searchTerms
 *	 @access  private
 */
exports.getAllSearchTerms = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(SearchTerm, { limit: 10, ...req.query })
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get searched term by id
 *	 @route   GET api/v1/admin/searchTerms/:searchTermId
 *	 @access  private
 */
exports.getSearchTermById = asyncHandler(async (req, res, next) => {
  const { searchTermId } = req.params
  // get required searchTerm by id
  const searchTerm = await SearchTerm.findByPk(searchTermId)
  if (!searchTerm)
    return next(new ErrorResponse(`No search term found with id ${searchTermId}`, 404))

  res.status(200).json({
    success: true,
    data: searchTerm
  })
})
/**
 *	 @desc    update searched term by id
 *	 @route   PUT api/v1/admin/searchTerms/:searchTermId
 *	 @access  private
 */
exports.updateSearchTermById = asyncHandler(async (req, res, next) => {
  const { searchTermId } = req.params
  fieldFilter(req.body, ['searchCount'])
  // get required searchTerm by id
  const searchTerm = await SearchTerm.findByPk(searchTermId)
  if (!searchTerm)
    return next(new ErrorResponse(`No search term found with id ${searchTermId}`, 404))

  await searchTerm.update(req.body)

  res.status(200).json({
    success: true,
    data: searchTerm
  })
})
/**
 *	 @desc    delete searched term by id
 *	 @route   DELETE api/v1/admin/searchTerms/:searchTermId
 *	 @access  private
 */
exports.deleteSearchTermById = asyncHandler(async (req, res, next) => {
  const { searchTermId } = req.params
  // get required searchTerm by id
  const searchTerm = await SearchTerm.findByPk(searchTermId)
  if (!searchTerm)
    return next(new ErrorResponse(`No search term found with id ${searchTermId}`, 404))

  await searchTerm.destroy()
  res.status(204).end()
})
