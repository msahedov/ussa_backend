const express = require('express')
const { getAllSearchLikeTerms } = require('../../controllers').api.v1.public.searchTermsControllers

const router = express.Router()
/**
 * @access public
 */
router.route('/').get(getAllSearchLikeTerms)

module.exports = router
