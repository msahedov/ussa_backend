const express = require('express')
const router = express.Router()

router.use('/users', require('./usersRoutes'))
router.use('/products', require('./productsRoutes'))
router.use('/inbox', require('./inboxRoutes'))
router.use('/categories', require('./categoriesRoutes'))
router.use('/banners', require('./bannersRoutes'))
router.use('/reviews', require('./reviewsRoutes'))
router.use('/orders', require('./ordersRoutes'))
router.use('/searchTerms', require('./searchTermsRoutes'))
router.use('/subCategories', require('./subCategoriesRoutes'))
router.use('/markets', require('./marketsRoutes'))
router.use('/brands', require('./brandsRoutes'))
router.use('/rates', require('./usdRatesRoutes'))

module.exports = router
