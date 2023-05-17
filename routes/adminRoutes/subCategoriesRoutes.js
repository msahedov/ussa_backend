const express = require('express')
const {
  getAllSubCategories,
  createSubCategory,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById
} = require('../../controllers').api.v1.admin.subCategoriesControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('admin'))

router.route('/').get(getAllSubCategories).post(createSubCategory)

router
  .route('/:subCategoryId')
  .get(getSubCategoryById)
  .put(updateSubCategoryById)
  .delete(deleteSubCategoryById)

module.exports = router
