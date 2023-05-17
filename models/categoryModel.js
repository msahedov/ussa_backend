/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const { fileCope } = require('../utils')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class Category extends Model {}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
Category.init(
  {
    name_ru: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name_tm: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    image: DataTypes.STRING
  },
  {
    sequelize: db,
    modelName: 'categories',
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
Category.beforeUpdate((instance, options) => {
  const changedFields = instance.changed() || []
  // old image will be deleted
  if (changedFields.includes('image') && instance['_previousDataValues']['image'])
    fileCope.deleteFiles(instance['_previousDataValues']['image'])
})

Category.beforeDestroy((instance, options) => {
  // if it has image will be deleted from server
  if (instance.getDataValue('image')) fileCope.deleteFiles(instance.getDataValue('image'))
})

/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
// if included model is counted then outer models count method does not work properly
// AVOID THIS SCOPE
Category.addScope('subCategoriesNumberIncluded', {
  attributes: {
    include: [[db.fn('COUNT', db.col('subCategories.categoryId')), 'subCategoryNumber']]
  },
  group: ['categories.id']
})
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */

module.exports = Category
