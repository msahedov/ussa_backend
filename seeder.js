const dotenv = require('dotenv')
dotenv.config({ path: './config/.env' })
const { users, categories, subCategories, markets, products } = require('./data')
const { User, Category, SubCategory, Market, Product } = require('./models')
const { asyncHandler } = require('./middlewares')

const importData = asyncHandler(async () => {
  try {
    await User.bulkCreate(users)
    await Category.bulkCreate(categories)
    await SubCategory.bulkCreate(subCategories)
    await Market.bulkCreate(markets)
    await Product.bulkCreate(products)

    console.log('Data Imported!')
    process.exit()
  } catch (err) {
    console.error(err)
    process.exit()
  }
})

importData()


