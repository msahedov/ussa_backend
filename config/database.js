const { Sequelize } = require('sequelize')
module.exports = new Sequelize(
  'e-commerce',//process.env.DB_NAME,
  'postgres',//process.env.DB_USERNAME,
  '1234',//process.env.DB_PASSWORD,
  {
    host: 'localhost',
    dialect: 'postgres',//process.env.DB_TYPENAME,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }

    // logging: false, // you can set either to false or function
  }
)
