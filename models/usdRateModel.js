/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const {ErrorResponse} = require('../utils')
/**
*  ============================================================
*                    @MODEL_DECLARATION
*  ============================================================
*/
class UsdRate extends Model {}
/**
*  ============================================================
*                   @MODEL_INITIALIZATION
*  ============================================================
*/
UsdRate.init(
  {
    value: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize: db,
    modelName: 'usd_rates',
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
UsdRate.beforeCreate(async(instance, options) => {
  // this hook is for making sure that there is only one activated rate
  if(instance.getDataValue('active')){
    const state = await UsdRate.findOne({where: {active: true }});
    if (state) {
      return Promise.reject(new ErrorResponse(`There is already activated rate`, 400))
    }
  }
})
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


module.exports = UsdRate
