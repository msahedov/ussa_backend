const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
const Category = require('./categoryModel')

class SubCategory extends Model {}

SubCategory.init(
  {
    name_ru: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name_tm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize: db,
    modelName: 'subCategories',
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

/**
 *  ============================================================
 *                      @MODEL_SCOPES
 *  ============================================================
 */
// if category fetched with its subcategory, number will be limited to 10 (#to paginate subCategories refer to subCategories route)
Category.addScope('subCategoryIncluded', { include: { model: SubCategory, limit: 10 } })
SubCategory.addScope('noAttributes', { attributes: [] })
Category.addScope('subCategoryWithNoAttributesIncluded', {
  include: { model: SubCategory.scope('noAttributes') }
})
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */
// Category-to-SubCategories One-to-Many
Category.hasMany(SubCategory, {
  foreignKey: { name: 'categoryId', allowNull: false },
  onDelete: 'cascade',
  hooks: true
})
SubCategory.belongsTo(Category, { as: 'category' })

module.exports = SubCategory
