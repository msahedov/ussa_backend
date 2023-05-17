/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const bcrypt = require('bcryptjs')
const { ErrorResponse, fileCope } = require('../utils')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class User extends Model {
  toJSON() {
    return { ...this.get(), password: undefined }
  }

  async passwordValidation(password) {
    return await bcrypt.compare(password, this.getDataValue('password'))
  }

  passwordChangedAfter(JWT_timestamp) {
    if (this.passwordChangedAt && this.passwordChangedAt.getTime() > JWT_timestamp * 1000)
      return true
    return false
  }

  isLoggedOut() {
    return this.getDataValue('loggedOut')
  }
}

/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 3
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /\b6[1-5][0-9]{6}\b/
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passwordChangedAt: DataTypes.DATE,
    loggedOut: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['user', 'partner', 'admin']]
      },
      defaultValue: 'user'
    },
    image: DataTypes.STRING
  },
  {
    sequelize: db,
    modelName: 'users'
  }
)

/**
 *  ============================================================
 *                      @CUSTOM_METHODS
 *  ============================================================
 */
//custom password cryptyng function
const passwordCryption = async instance => {
  const password = instance.getDataValue('password')
  if (isPasswordValid(password)) {
    const hashedPassword = await bcrypt.hash(password, 8)
    instance.set('password', hashedPassword)
  } else {
    return Promise.reject(new ErrorResponse('Password must be 6 characters at least', 400))
  }
}
// custom passwordValidity function
const isPasswordValid = password => {
  // checks for password length and returns false if password length less than 6
  return password.length < 6 ? false : true
}
/**
 *  ============================================================
 *                      @MODEL_HOOKS
 *  ============================================================
 */
User.beforeCreate(async (instance, options) => {
  await passwordCryption(instance)
})

User.beforeUpdate(async (instance, options) => {
  const changedFields = instance.changed() || []
  // password needs to be crypted before save
  if (changedFields.includes('password')) await passwordCryption(instance)
  // old image will be deleted
  if (changedFields.includes('image') && instance['_previousDataValues']['image'])
    fileCope.deleteFiles(instance['_previousDataValues']['image'])
})

User.beforeDestroy((instance, options) => {
  if (instance.getDataValue('image')) fileCope.deleteFiles(instance.getDataValue('image'))
})

/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
User.addScope('simplified', {
  attributes: { exclude: ['loggedOut', 'passwordChangedAt', 'createdAt', 'updatedAt', 'password'] }
})
User.addScope('phoneNumberExcluded', {
  attributes: { exclude: ['phoneNumber'] }
})

/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
module.exports = User
