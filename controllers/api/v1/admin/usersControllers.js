/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const { User } = require('../../../../models')
const { ApiFeatures, ErrorResponse, ImageManipulation, fieldFilter } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')
/**
 *  ============================================================
 *                   	@ADMIN_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    get all users
 *	 @route   GET api/v1/admin/users
 *	 @access  private
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(User, { limit: 10, ...req.query })
    .getResultWithScopes('simplified')
    .filter()
    .getAllItemsOfModel()

  res.status(200).set('X-Total-Count', count).json({
    success: true,
    data: rows
  })
})
/**
 *	 @desc    get user by id
 *	 @route   GET api/v1/admin/users/:userId
 *	 @access  private
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params

  const user = await User.findByPk(userId)
  if (!user) return next(new ErrorResponse(`No user found with ${userId} id`, 404))

  res.status(200).json({
    success: true,
    data: user
  })
})
/**
 *	 @desc    update a user
 *	 @route   PUT api/v1/admin/users/:userId
 *	 @access  private
 */
exports.updateUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params
  // get requested user
  const user = await User.findByPk(userId)
  if (!user) return next(new ErrorResponse(`No user found with ${userId} id`, 404))

  // black listed fields are filtered
  fieldFilter(req.body, ['password'])
  // if file is uploaded then image field name added to db
  if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

  await user.update(req.body)

  // if everything goes ok then new image is uploaded
  if (req.file) await new ImageManipulation(req.file).readAndWrite()

  res.status(200).json({
    success: true,
    data: user
  })
})
/**
 *	 @desc    delete a user by id
 *	 @route   DELETE api/v1/admin/users/:userId
 *	 @access  private
 */
exports.deleteUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params
  // get requested user
  const user = await User.findByPk(userId)
  if (!user) return next(new ErrorResponse(`No user found with ${userId} id`, 404))

  await user.destroy()

  res.status(204).end()
})
/**
 *	 @desc    delete profile image of user by id
 *	 @route   PUT api/v1/admin/users/:userId/deleteImage
 *	 @access  private
 */
exports.deleteImageOfUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params
  // get requested user
  const user = await User.findByPk(userId)
  if (!user) return next(new ErrorResponse(`No user found with ${userId} id`, 404))

  await user.update({ image: null })

  res.status(204).end()
})
