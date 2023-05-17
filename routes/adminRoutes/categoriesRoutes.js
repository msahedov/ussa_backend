const express = require('express')
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  deleteCategoryImageById
} = require('../../controllers').api.v1.admin.categoriesControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const { CATEGORY_UPLOAD_IMG_SIZE, SINGLE_UPLOAD_FIELD_NAME } = require('../../utils').constants

const router = express.Router()

/**
 * @access private
 */
router.use(accessRestriction('admin'))

router
  .route('/')
  .get(getAllCategories)
  .post(
    multerHandler(CATEGORY_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/categories', 'category'),
    createCategory
  )

router
  .route('/:categoryId')
  .get(getCategoryById)
  .put(
    multerHandler(CATEGORY_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/categories', 'category'),
    updateCategoryById
  )
  .delete(deleteCategoryById)

router.delete('/:categoryId/deleteImage', deleteCategoryImageById)

module.exports = router
