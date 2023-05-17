const express = require('express')
const { getAllRates, createRate, getRateById, updateRateById, deleteRate } =
  require('../../controllers').api.v1.admin.usdRatesControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('admin'))

router
  .route('/')
  .get(getAllRates)
  .post(createRate)

router
  .route('/:rateId')
  .get(getRateById)
  .put(updateRateById)
  .delete(deleteRate)

module.exports = router
