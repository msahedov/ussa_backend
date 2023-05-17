/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const User = require('./userModel')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Order extends Model {}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Order.init(
  {
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['inCash', 'byTerminal', 'byCreditCard']]
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: null
    },
    paidAt: DataTypes.DATE,
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deliveredAt: DataTypes.DATE,
    isSubmitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false //should be set false when payment Result is pending
    }
  },
  {
    sequelize: db,
    modelName: 'orders',
    paranoid: true
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
Order.beforeUpdate(async (instance, options) => {
  console.log(`Order's beforeUpdate hook is triggered`)
  const changedFields = instance.changed() || []
  // handling when order is submitted
  if (changedFields.includes('isSubmitted') && instance.getDataValue('isSubmitted')) {
    const orderedItems = await instance.getOrderedProducts()
    // loop through each orderedProducts and decreament countInStock value by ordered quantity
    for (let i = 0; i < orderedItems.length; i++) {
      const product = orderedItems[i]
      await product.update({
        countInStock:
          product.getDataValue('countInStock') - product.getDataValue('orderItems')['quantity']
      })
    }
  }
  if (changedFields.includes('isDelivered') && instance.getDataValue('isDelivered')) {
    instance.set('deliveredAt', Date.now())
  }
})
/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
Order.addScope('simplified', { attributes: { exclude: ['createdAt', 'updatedAt'] } })
Order.addScope('simplifiedForPartner', {
  attributes: { exclude: ['createdAt', 'updatedAt', 'totalPrice'] }
})
Order.addScope('customerIncluded', { include: { model: User.scope('simplified'), as: 'customer' } })
Order.addScope('submitted', { where: { isSubmitted: true } })
Order.addScope('delivered', { where: { isDelivered: true } })
Order.addScope('forced', { paranoid: false })
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
// One-to-Many relationship
User.hasMany(Order, { foreignKey: 'customerId' })
Order.belongsTo(User, { as: 'customer' })

module.exports = Order
