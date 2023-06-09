/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { DataTypes, Model } = require('sequelize')
const db = require('../config/database')
/**
 *  ============================================================
 *                    @MODEL_DECLARATION
 *  ============================================================
 */
class SearchTerm extends Model {
  addSearchCount() {
    this.set('searchCount', this.getDataValue('searchCount') + 1)
  }
}
/**
 *  ============================================================
 *                   @MODEL_INITIALIZATION
 *  ============================================================
 */
SearchTerm.init(
  {
    term: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    searchCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize: db,
    modelName: 'searchTerms',
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

/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */

module.exports = SearchTerm
