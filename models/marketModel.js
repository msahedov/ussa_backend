/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const User = require('./userModel')
const Category = require('./categoryModel')
const SubCategory = require('./subCategoryModel')
const { fileCope, ErrorResponse } = require('../utils')

/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Market extends Model {
  /**
   * this method adds rating number to the market model instance
   */
  addNumRating() {
    this.set('numRatings', this.getDataValue('numRatings') + 1)
  }
  /**
   * this method sets new average rating to rating field of market instance
   * @param {*} newRate newRate - is rating which gives user
   */
  calcAverageRate(newRate) {
    newRate = Number(newRate).toFixed(2)
    const sanawjy =
      (this.getDataValue('numRatings') - 1) * Number(this.getDataValue('rating')) + Number(newRate)
    const newAverageRating = sanawjy / this.getDataValue('numRatings')
    this.set('rating', newAverageRating.toFixed(2))
  }
}

/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Market.init(
  {
    name_tm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name_ru: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address_tm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address_ru: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /\b6[1-5][0-9]{6}\b/
      }
    },
    rating: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    numRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  },
  {
    sequelize: db,
    modelName: 'markets'
  }
)
// Rating model
const MarketRating = db.define(
  'marketRating',
  {
    rating: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    }
  },
  { updatedAt: false }
)

/**
 *  ============================================================
 *                      @CUSTOM_METHODS
 *  ============================================================
 */

/**
 *  ============================================================
 *                      @MODEL_HOOKS
 *  ============================================================
 */
Market.beforeCreate(async (instance, options) => {
  console.log('Markets before create hook is triggered')
  // get owner of market and check whether that owner already has market
  const owner = await instance.getOwner()
  if (owner.getDataValue('role') !== 'partner')
    return Promise.reject(new ErrorResponse('Market can belong only to partner', 400))
  if (await owner.getMarket())
    return Promise.reject(new ErrorResponse('This partner already owns market', 400))
})

Market.beforeUpdate(async (instance, options) => {
  const changedFields = instance.changed() || []
  // old images will be deleted
  if (changedFields.includes('image') && instance['_previousDataValues']['image'])
    fileCope.deleteFiles(instance['_previousDataValues']['image'])
})

Market.beforeDestroy((instance, options) => {
  console.log('Market before destroy hook is triggered', instance)
  //when market deleted forcefully then it will delete images related market
  fileCope.deleteFiles(...instance.getDataValue('images'))
})
/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
Market.addScope('simplified', { attributes: { exclude: ['createdAt', 'updatedAt'] } })
Market.addScope('ownerIncluded', { include: { model: User.scope('simplified'), as: 'owner' } })
Market.addScope('ratingsIncluded', {
  include: {
    model: User.scope('simplified', 'phoneNumberExcluded'),
    as: 'ratedUsers',
    through: { attributes: ['rating', 'createdAt'] }
  }
})
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */

// User-to-Market One-to-One
User.hasOne(Market, { foreignKey: { name: 'ownerId', allowNull: false }, hooks: true })
Market.belongsTo(User, { as: 'owner' })

// Rating table Many-to-Many
User.belongsToMany(Market, { as: 'ratedMarkets', through: MarketRating })
Market.belongsToMany(User, { as: 'ratedUsers', through: MarketRating })

module.exports = Market
