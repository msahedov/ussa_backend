/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const User = require('./userModel')
const Product = require('./productModel')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Review extends Model {}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Review.init(
  {
    rating: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    description: {
      type: DataTypes.STRING,
      validate: {
        max: 100
      }
    },
    approvedByAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize: db,
    modelName: 'reviews',
    updatedAt: false
  }
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

/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
Review.addScope('approved', { where: { approvedByAdmin: true } })
Review.addScope('productIncluded', { include: { model: Product.scope('simplified') } })
Product.addScope('reviewsIncluded', {
  include: {
    model: User.scope('simplified', 'phoneNumberExcluded'),
    as: 'reviewedUsers',
    through: { attributes: ['rating', 'description', 'createdAt', 'approvedByAdmin'] }
  }
})
Product.addScope('approvedReviewsIncluded', {
  include: {
    model: User.scope('simplified', 'phoneNumberExcluded'),
    as: 'reviewedUsers',
    through: {
      attributes: ['rating', 'description', 'createdAt'],
      where: { approvedByAdmin: true }
    }
  }
})
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
// SUPER Many-to-Many relationship between User and Product through Review table
User.belongsToMany(Product, { as: 'reviewedProducts', through: Review })
Product.belongsToMany(User, { as: 'reviewedUsers', through: Review })
Review.belongsTo(Product)
Review.belongsTo(User)
Product.hasMany(Review)
User.hasMany(Review)

module.exports = Review
