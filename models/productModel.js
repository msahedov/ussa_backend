/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model, Op } = require('sequelize')
const db = require('../config/database')
const User = require('./userModel')
const SubCategory = require('./subCategoryModel')
const Market = require('./marketModel')
const { fileCope } = require('../utils')
const Brand = require('./brandModel')
const UsdRate = require('./usdRateModel')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Product extends Model {
  /**
   * this method adds view count to product instance
   */
  addViewCount() {
    this.set('viewCount', this.getDataValue('viewCount') + 1)
  }
  /**
   * this method adds like count to product instance
   */
  addLikeCount() {
    this.set('likeCount', this.getDataValue('likeCount') + 1)
  }
  /**
   * this method adds review count to product instance
   */
  addNumReview() {
    this.set('numReviews', this.getDataValue('numReviews') + 1)
  }
  /**
   * this method sets new average rating to rating field of product instance
   * @param {*} newRate newRate - is rating which gives user
   */
  calcAverageRate(newRate) {
    newRate = Number(newRate).toFixed(2)
    const sanawjy =
      (this.getDataValue('numReviews') - 1) * Number(this.getDataValue('rating')) + Number(newRate)
    const newAverageRating = sanawjy / this.getDataValue('numReviews')
    this.set('rating', newAverageRating.toFixed(2))
  }
  /**
   * this method subtracts 1 from product *never used method (cause number of product instance in cart is dynamic)
   */
  decreamentCountInStock() {
    this.set('countInStock', Number(this.getDataValue('countInStock')) - 1)
  }
}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Product.init(
  {
    name_ru: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name_tm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    countInStock: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    rating: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    numReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    description_ru: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description_tm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    price_tmt: {
      type: DataTypes.VIRTUAL
    }
  },
  {
    sequelize: db,
    modelName: 'products'
  }
)
// Cart model
const Cart = db.define(
  'carts',
  {
    quantity: {
      type: DataTypes.DECIMAL,
      allowNull: false
    }
  },
  { updatedAt: false }
)
/**
 *  ============================================================
 *                      @CUSTOM_METHODS
 *  ============================================================
 */
 const addProductToCategory = async (marketId, categoryId) => {
  const market = await Market.findByPk(marketId)
  const category = await Category.findByPk(categoryId)
  const state = await market.hasCategory(category)

  if (!state) await market.addCategory(category)
}

const removeProductFromCategory = async (marketId, categoryId) => {
  const market = await Market.findByPk(marketId)
  const category = await Category.findByPk(categoryId)
  const state = await market.hasCategory(category)
  const numberOfProducts = await category.countActiveProducts({
    where: { marketId }
  })

  // if this instance is last one then numberOfDishes will be 1
  if (state && numberOfDishes === 1) await restaraunt.removeMenu(menu)
}
/**
 *  ============================================================
 *                      @MODEL_HOOKS
 *  ============================================================
 */
Product.beforeDestroy((instance, options) => {
  console.log('Product before destroy hook is triggered')
  // when product deleted forcefully then it will delete images related to it
  fileCope.deleteFiles(...instance.getDataValue('images'))
})

Product.afterFind(async(instances, options) => {
  // get current active usd_rate
  const rate = await UsdRate.findOne({where: {active: true}})
  // checks if rate exists
  if (rate && instances instanceof Array) {
    // checks if returning value is array
    for (let i = 0; i < instances.length; i++) {
      instances[i].set('price_tmt', Number(rate.getDataValue('value'))*Number(instances[i].getDataValue('price')))
    } // if returning type is object (i.e. single product) then ...
  } else if (rate && instances instanceof Object) {
    instances.set('price_tmt', Number(rate.getDataValue('value'))*Number(instances.getDataValue('price')))
  }
})
/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */

Product.addScope('simplified', { attributes: { exclude: ['createdAt', 'updatedAt'] } })
Product.addScope('marketIncluded', { include: { model: Market.scope('simplified'), as: 'market' } }) // include creator with simplified scope
Product.addScope('limited', { limit: 5 })
Product.addScope('actives', { where: { active: true } })
Product.addScope('inActives', { where: { active: false } })
Product.addScope('similarProducts', product => {
  return {
    where: {
      [Op.or]: [
        { brand: product.getDataValue('brand') },
        { subCategoryId: product.getDataValue('subCategoryId') }
      ],
      id: { [Op.ne]: product.getDataValue('id') }
    }
  }
})
Product.addScope('creatorRestricted', user => {
  return {
    where: {
      creatorId: user.getDataValue('id')
    }
  }
})

// this is for admin
SubCategory.addScope('productsIncluded', {
  include: [
    { model: Product.scope('simplified', 'actives', 'limited'), as: 'activeProducts' },
    { model: Product.scope('simplified', 'inActives', 'limited'), as: 'inActiveProducts' }
  ]
})
// and this is for specific partner
SubCategory.addScope('productsIncludedForSpecificPartner', user => {
  return {
    include: [
      {
        model: Product.scope('simplified', 'actives', 'limited', {
          method: ['creatorRestricted', user]
        }),
        as: 'activeProducts'
      },
      {
        model: Product.scope('simplified', 'inActives', 'limited', {
          method: ['creatorRestricted', user]
        }),
        as: 'inActiveProducts'
      }
    ]
  }
})
// and this is for user
SubCategory.addScope('activeProductsIncluded', {
  include: { model: Product.scope('actives', 'limited') }
})

// this is for admin
Brand.addScope('productsIncluded', {
  include: [
    { model: Product.scope('simplified', 'actives', 'limited'), as: 'activeProductsInBrand' },
    { model: Product.scope('simplified', 'inActives', 'limited'), as: 'inActiveProductsInBrand' }
  ]
})
// and this is for user and partner
Brand.addScope('activeProductsIncluded', {
  include: { model: Product.scope('actives', 'limited') }
})
 
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
// Market-to-Products One-to-Many
Market.hasMany(Product, {
  foreignKey: 'marketId',
  onDelete: 'cascade',
  hooks: true
})
Product.belongsTo(Market, { as: 'market' })

// SubCategory-to-Products One-to-Many
SubCategory.hasMany(Product, {
  foreignKey: { name: 'subCategoryId', allowNull: false },
  onDelete: 'cascade',
  hooks: true
})
Product.belongsTo(SubCategory, { as: 'subCategory' })

// Barand-to-Products One-to-Many
Brand.hasMany(Product, { 
  foreignKey: 'brandId',
  onDelete: 'cascade',
  hooks: true
})
Product.belongsTo(Brand, { as: 'brand'} )


// Favoites table Many-to-Many
User.belongsToMany(Product, { as: 'favoredProducts', through: 'favorites', timestamps: false })
Product.belongsToMany(User, { as: 'favoredUsers', through: 'favorites', timestamps: false })

// Likes table Many-to-Many
User.belongsToMany(Product, { as: 'likedProducts', through: 'likes', timestamps: false })
Product.belongsToMany(User, { as: 'likedUsers', through: 'likes', timestamps: false })

// Association scopes (helpfull when mixins take action)
SubCategory.hasMany(Product.scope('actives'), { as: 'activeProducts' })
SubCategory.hasMany(Product.scope('inActives'), { as: 'inActiveProducts' })

// Association scopes (helpfull when mixins take action)
Brand.hasMany(Product.scope('actives'), { as: 'activeProductsInBrand' })
Brand.hasMany(Product.scope('inActives'), { as: 'inActiveProductsInBrand' })

// Cart table Many-to-Many
User.belongsToMany(Product, { as: 'cartedProducts', through: Cart })
Product.belongsToMany(User, { as: 'cartedUsers', through: Cart })

module.exports = Product
