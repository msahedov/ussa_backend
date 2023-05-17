/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const Order = require('./orderModel')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class PaymentResult extends Model {}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
PaymentResult.init(
  {
    paymentId: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING
    },
    updateTime: {
      type: DataTypes.STRING
    },
    userCredential: {
      type: DataTypes.STRING
    }
  },
  {
    sequelize: db,
    modelName: 'paymentResults'
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

/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */

Order.hasOne(PaymentResult)
PaymentResult.belongsTo(Order, { foreignKey: 'orderId' })

module.exports = PaymentResult
