const express = require('express')
const { getAllSubCategories, getSubCategoryById } =
  require('../../controllers').api.v1.partner.subCategoriesControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('partner'))

router.get('/:partnerId/subCategories', doubleCheck, getAllSubCategories)
router.get('/:partnerId/subCategories/:subCategoryId', doubleCheck, getSubCategoryById)

module.exports = router
