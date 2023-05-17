/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const bcrypt = require('bcryptjs')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Striker extends Model {


}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Striker.init(
    {
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        time_stamp: DataTypes.DATE
    },
    {
        sequelize: db,
        modelName: 'strikers',
        createdAt: 'time_stamp',

    }
)
/**
 *  ============================================================
 *                      @CUSTOM_METHODS
 *  ============================================================
 */
//custom code cryptyng function
// const codeCryption = async instance => {
//     const verification_code = instance.getDataValue('verification_code')

//     const hashed_verification_code = await bcrypt.hash(verification_code, 8)
//     instance.set('verification_code', hashed_verification_code)
// }
/**
 *  ============================================================
 *                      @MODEL_HOOKS
 *  ============================================================
 */
// Striker.beforeValidate((instance, options) => {
//     console.log(instance.getDataValue('phoneNumber'))
//     instance.set('phoneNumber', instance.getDataValue('phoneNumber').slice(4))
// })
// Striker.beforeCreate(async (instance, options) => {
//     await codeCryption(instance)
// })
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

module.exports = Striker
