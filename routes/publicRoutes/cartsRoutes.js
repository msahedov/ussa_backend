const express = require('express')
const {
  getCartProducts,
  getCartProductById,
  addProductToCart,
  removeProductFromCart,
  emptyCartByUserId
} = require('../../controllers').api.v1.public.cartsControllers
const { accessRestriction, doubleCheck } = require('../../controllers').api.v1.authControllers
const router = express.Router()

router.use(accessRestriction('user'))
/**
 * @access private
 */
router
  .route('/:userId/carts')
  .get(doubleCheck, getCartProducts)
  .delete(doubleCheck, emptyCartByUserId)
router.get('/:userId/carts/:productId', doubleCheck, getCartProductById)
router.post('/:userId/carts/:productId/add', doubleCheck, addProductToCart)
router.delete('/:userId/carts/:productId/remove', doubleCheck, removeProductFromCart)

module.exports = router
