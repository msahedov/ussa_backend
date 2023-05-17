/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { Market } = require('../../../../models')
const { ApiFeatures, ErrorResponse, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   @PUBLIC_CONTROLLERS
 *  ============================================================
 */
/**
 * @desc    gets all markets
 * @route   GET api/v1/public/markets
 * @access  public
 */
exports.getAllMarkets = asyncHandler(async (req, res, next) => {
  let { count, rows } = await new ApiFeatures(Market, { limit: 10, ...req.query })
    .getResultWithScopes('simplified')
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *  @desc    gets all markets
 *  @route   GET api/v1/public/markets
 *  @access  public
 */
exports.getMarketById = asyncHandler(async (req, res, next) => {
  const { marketId } = req.params
  // get required market
  const market = await Market.scope('ratingsIncluded').findByPk(marketId)
  if (!market) return next(new ErrorResponse('No market such id', 404))

  res.status(200).json({
    success: true,
    data: market
  })
})
/**
 *  @desc    rates market by id
 *  @route   POST api/v1/public/markets/:marketId/rate
 *  @access  public
 */
exports.rateMarketById = asyncHandler(async (req, res, next) => {
  const { marketId } = req.params
  const { rating } = req.body
  // get required market
  const market = await Market.findByPk(marketId)
  if (!market) return next(new ErrorResponse(`No market found with id ${marketId}`, 404))

  const state = await req.user.hasRatedMarket(market)
  if (state) return next(new ErrorResponse(`You can not rate already rated market`, 400))

  await market.addRatedUser(req.user, { through: { rating: rating.toFixed(2) } })
  market.addNumRating()
  await market.save()
  market.calcAverageRate(rating)
  await market.save()

  res.status(200).json({
    success: true,
    data: market
  })
})
