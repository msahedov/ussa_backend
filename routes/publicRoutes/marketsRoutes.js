const express = require('express')
const { getAllMarkets, getMarketById, rateMarketById } =
  require('../../controllers').api.v1.public.marketsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const router = express.Router()

/**
 * @access public
 */
router.get('/', getAllMarkets)
router.get('/:marketId', getMarketById)

router.use(accessRestriction('user'))
/**
 * @access private
 */
router.post('/:marketId/rate', rateMarketById)

module.exports = router
