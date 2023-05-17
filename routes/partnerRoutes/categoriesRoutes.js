const express = require('express')
const { getAllCategories, getCategoryById } =
  require('../../controllers').api.v1.partner.categoriesControllers
const { doubleCheck, accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()
/**
 * @access private
 */
router.use(accessRestriction('partner'))

router.get('/:partnerId/categories', doubleCheck, getAllCategories)
router.get('/:partnerId/categories/:categoryId', doubleCheck, getCategoryById)

module.exports = router
