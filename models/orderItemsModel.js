/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const Product = require('./productModel')
const Order = require('./orderModel')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class OrderItems extends Model {}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
OrderItems.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    }
  },
  {
    sequelize: db,
    modelName: 'orderItems',
    timestamps: false
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
OrderItems.beforeCreate(async (instance, options) => {
  console.log('OrderItems beforeCreate hook is triggered')
  const product = await Product.scope('actives').findByPk(instance.getDataValue('productId'))
  const priceWithDiscount =
    Math.round(
      Number(product.getDataValue('price')) * (100 - Number(product.getDataValue('discount')))
    ) / 100
  instance.set('totalPrice', priceWithDiscount * instance.getDataValue('quantity'))
})
/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
Order.addScope('orderedItemsIncluded', {
  include: {
    model: Product.scope('simplified'),
    as: 'orderedProducts',
    through: { attributes: ['totalPrice', 'quantity'] }
  }
})
Order.addScope('orderedItemsIncludedWithSpecificProductId', productId => {
  return {
    include: {
      model: Product.scope('simplified'),
      as: 'orderedProducts',
      through: { attributes: [] },
      where: {
        id: productId
      }
    }
  }
})
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
// OrderItems table Many-to-Many
Order.belongsToMany(Product, { as: 'orderedProducts', through: OrderItems })
Product.belongsToMany(Order, { as: 'orderedOrders', through: OrderItems })

module.exports = OrderItems
