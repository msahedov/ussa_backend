const express = require('express')
const { getAllSearchTerms, getSearchTermById, updateSearchTermById, deleteSearchTermById } =
  require('../../controllers').api.v1.admin.searchTermsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()

router.use(accessRestriction('admin'))
/**
 * @access private
 */
router.route('/').get(getAllSearchTerms)
// create functionality is implemented when term is searched from products route

router
  .route('/:searchTermId')
  .get(getSearchTermById)
  .put(updateSearchTermById)
  .delete(deleteSearchTermById)

module.exports = router
