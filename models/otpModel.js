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
class Otp extends Model {
  async codeValidation(verification_code) {
    return await bcrypt.compare(verification_code, this.getDataValue('verification_code'))
  }

  isVerifiedTime(currentTime) {
    console.log(this.getDataValue('issued_at'))
    console.log(currentTime)
    if (
      this.getDataValue('issued_at') &&
      currentTime.getTime() - this.getDataValue('issued_at').getTime() > 1000 * 60
    )
      return true
    return false
  }
}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Otp.init(
  {
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /\b6[1-5][0-9]{6}\b/
      }
    },
    verification_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    issued_at: DataTypes.DATE
  },
  {
    sequelize: db,
    modelName: 'otps',
    createdAt: 'issued_at',
    updatedAt: false
  }
)
/**
 *  ============================================================
 *                      @CUSTOM_METHODS
 *  ============================================================
 */
//custom code cryptyng function
const codeCryption = async instance => {
  const verification_code = instance.getDataValue('verification_code')

  const hashed_verification_code = await bcrypt.hash(verification_code, 8)
  instance.set('verification_code', hashed_verification_code)
}
/**
 *  ============================================================
 *                      @MODEL_HOOKS
 *  ============================================================
 */
Otp.beforeValidate((instance, options) => {
  console.log(instance.getDataValue('phoneNumber'))
  instance.set('phoneNumber', instance.getDataValue('phoneNumber').slice(4))
})
Otp.beforeCreate(async (instance, options) => {
  await codeCryption(instance)
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

module.exports = Otp
