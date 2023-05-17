/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { SearchTerm } = require('../../../../models')
const { ApiFeatures, ErrorResponse } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    gets all searched terms from database
 *	 @route   GET api/v1/public/searchTerms
 *	 @access  public
 */
exports.getAllSearchLikeTerms = asyncHandler(async (req, res, next) => {
  // by deafult gets 10 result in decreasing order by searchCount
  const { count, rows } = await new ApiFeatures(SearchTerm, {
    limit: 10,
    sort: '-searchCount',
    ...req.query
  })
    .filter()
    .getAllItemsOfModel()

  const terms = rows.map(row => row.term)

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: terms
  })
})
