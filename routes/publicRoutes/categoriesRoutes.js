const express = require('express')
const { getAllCategories, getCategoryById } =
  require('../../controllers').api.v1.public.categoriesControllers

const router = express.Router()
/**
 * @access public
 */
router.get('/', getAllCategories)
router.get('/:categoryId', getCategoryById)

module.exports = router
