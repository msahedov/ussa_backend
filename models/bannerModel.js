/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const Category = require('./categoryModel')
const { fileCope } = require('../utils')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Banner extends Model {}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Banner.init(
  {
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    page_path: DataTypes.STRING
  },
  {
    sequelize: db,
    modelName: 'banners',
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
Banner.beforeDestroy((instance, options) => {
  // if it has image will be deleted from server
  if (instance.getDataValue('image')) fileCope.deleteFiles(instance.getDataValue('image'))
})

Banner.beforeUpdate((instance, options) => {
  const changedFields = instance.changed() || []
  if (changedFields.includes('image') && instance['_previousDataValues']['image'])
    fileCope.deleteFiles(instance['_previousDataValues']['image'])
})
/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
Banner.addScope('categoryIncluded', { include: { model: Category, as: 'category' } })
Category.addScope('bannerIncluded', { include: { model: Banner, limit: 10 } })
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
// Category-to-Banners One-to-Many
Category.hasMany(Banner, { foreignKey: 'categoryId' })
Banner.belongsTo(Category, { as: 'category' })

module.exports = Banner
