const express = require('express')
const router = express.Router()

router.use('/', require('./productsRoutes'))
router.use('/', require('./inboxRoutes'))
router.use('/', require('./ordersRoutes'))
router.use('/', require('./categoriesRoutes'))
router.use('/', require('./reviewsRoutes'))
router.use('/', require('./subCategoriesRoutes'))
router.use('/', require('./marketsRoutes'))
router.use('/', require('./brandsRoutes'))

module.exports = router
