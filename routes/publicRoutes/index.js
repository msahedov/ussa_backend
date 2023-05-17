const express = require('express')
const router = express.Router()

router.use('/', require('./productsRoutes'))
router.use('/categories', require('./categoriesRoutes'))
router.use('/subCategories', require('./subCategoriesRoutes'))
router.use('/searchTerms', require('./searchTermsRoutes'))
router.use('/banners', require('./bannersRoutes'))
router.use('/markets', require('./marketsRoutes'))
router.use('/brands', require('./brandsRoutes'))
router.use('/', require('./favoritesRoutes'))
router.use('/', require('./ordersRoutes'))
router.use('/', require('./reviewsRoutes'))
router.use('/', require('./cartsRoutes'))

module.exports = router
