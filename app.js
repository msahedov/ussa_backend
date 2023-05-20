const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const helmet = require('helmet')
const xss = require('xss-clean')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const { errorHandler, limitHandler, corsHandler } = require('./middlewares')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')


//const cors = require('cors')

// env vars
dotenv.config({ path: './config/.env' })
const app = express()

// Database setup configuration
const db = require('./config/database')


db.authenticate()
  .then(() => {
    console.log('Database connected...')
  })
  .catch(err => {
    console.log('Error: ' + err)
  })

// Setting cors configuration middleware
app.use(corsHandler());

//app.use(cors())

// Set security http headers
//app.use(helmet())

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(require('./config/swaggerOptions')), { explorer: true }))

// Rate-limit
app.use('/api', limitHandler(1000, 60))
// Body-parser
app.use(express.json())
// Cookie-parser
app.use(cookieParser(process.env.COOKIE_SECRET))
// Prevents from malicius html tags coming from input
app.use(xss())
// Setting static folder
app.use(express.static(`${__dirname}/public`))
// Compresses json texts
app.use(compression())

// Dev logs
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'))
}

// Require routes
app.use('/api/v1', require('./routes'))

// Error middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`)
  // await db.sync({ alter: true }) // you can uncomment if no changes applied to db columns
  // comment when it in production level

  console.log(`Database synced all models successfully`)
})
