const express = require('express')
const { getAllUsers, getUserById, updateUserById, deleteUserById, deleteImageOfUserById } =
  require('../../controllers').api.v1.admin.usersControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers
const { multerHandler, imageHandler } = require('../../middlewares')
const { AVATAR_UPLOAD_IMG_SIZE, SINGLE_UPLOAD_FIELD_NAME } = require('../../utils').constants

const router = express.Router()
/**
 * @access private
 */
router.use(accessRestriction('admin'))

router.get('/', getAllUsers)

router
  .route('/:userId')
  .get(getUserById)
  .put(
    multerHandler(AVATAR_UPLOAD_IMG_SIZE).single(SINGLE_UPLOAD_FIELD_NAME),
    imageHandler('img/users', 'user'),
    updateUserById
  )
  .delete(deleteUserById)

router.put('/:userId/deleteImage', deleteImageOfUserById)

module.exports = router
