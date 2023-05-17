/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
 const { DataTypes, Model } = require('sequelize')
 const Product = require('../models/productModel')
 const db = require('../config/database')
 const { fileCope } = require('../utils')
 /**
  *  ============================================================
  *                    @MODEL_DECLARATION
  *  ============================================================
  */
 class Brand extends Model {}
 /**
  *  ============================================================
  *                   @MODEL_INITIALIZATION
  *  ============================================================
  */
 Brand.init(
   {
     name_tm: DataTypes.STRING,
     name_ru: DataTypes.STRING,
     image: DataTypes.STRING
    
    },
   {
     sequelize: db,
     modelName: 'brands',
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
  Brand.addScope('simplified', { attributes: { exclude: ['createdAt', 'updatedAt'] } })
   
/**
 *  ============================================================
 *                   @MODEL_ASSOCIATIONS
 *  ============================================================
 */

module.exports = Brand
