const express = require('express')
const {
  getAllActiveProducts,
  getActiveProductById,
  addToFavorites,
  likeProductById,
  getAllActiveProductsForAuthoredUser,
  test
} = require('../../controllers').api.v1.public.productsControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()

/**
 * @access public
 */
router.get('/products', getAllActiveProducts)
router.get('/products/:productId', getActiveProductById)

router.use(accessRestriction('user'))
/**
 * @access private
 */
router.get('/authored/products', getAllActiveProductsForAuthoredUser)

router.post('/products/:productId/favorite', addToFavorites)
router.post('/products/:productId/like', likeProductById)

module.exports = router
