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
class Attacker extends Model {


}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Attacker.init(
    {
        ip_address:
        {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_blocked:
        {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        attack_date:
        {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize: db,
        modelName: 'attackers',
        createdAt: 'attack_date',

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
// Attacker.beforeValidate((instance, options) => {
//     console.log(instance.getDataValue('phoneNumber'))
//     instance.set('phoneNumber', instance.getDataValue('phoneNumber').slice(4))
// })
// Attacker.beforeCreate(async (instance, options) => {
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

module.exports = Attacker
