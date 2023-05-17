const express = require('express')
const { getAllSubCategories, getSubCategoryById } =
  require('../../controllers').api.v1.public.subCategoriesControllers

const router = express.Router()
/**
 * @access public
 */
router.get('/', getAllSubCategories)
router.get('/:subCategoryId', getSubCategoryById)

module.exports = router
