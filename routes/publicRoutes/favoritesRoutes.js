const express = require('express')
const { getFavoriteProducts, getFavoriteProductById, deleteFavoriteProductById } =
  require('../../controllers').api.v1.public.favoritesControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers
const router = express.Router()

router.use(accessRestriction('user'))
/**
 * @access private
 */
router.get('/:userId/favoriteProducts', doubleCheck, getFavoriteProducts)

router
  .route('/:userId/favoriteProducts/:productId')
  .get(doubleCheck, getFavoriteProductById)
  .delete(doubleCheck, deleteFavoriteProductById)

module.exports = router
