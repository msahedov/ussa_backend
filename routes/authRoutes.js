const express = require('express')
const {
  login,
  signUp,
  changeMe,
  logout,
  getMe,
  changePassword,
  deleteImage,
  accessRestriction,
  sendOtp
} = require('../controllers').api.v1.authControllers
const { limitHandler, multerHandler, imageHandler } = require('../middlewares')
const { AVATAR_UPLOAD_IMG_SIZE, SINGLE_UPLOAD_FIELD_NAME } = require('../utils').constants

const router = express.Router()
/**
 * @access public
 */
router.post('/login', limitHandler(5, 5), login)
router.post('/signup', limitHandler(5, 5), signUp)
router.post('/sendOtp', sendOtp)
/**
 * @access private
 */
router.use(accessRestriction('all'))
router.put('/changePassword', changePassword)
router.put('/logout', logout)
router.get('/getMe', getMe)
router.put(
  '/changeMe',
  multerHandler(AVATAR_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
  imageHandler('img/users', 'user'),
  changeMe
)
router.delete('/deleteImage', deleteImage)

module.exports = router
