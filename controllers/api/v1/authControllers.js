/**
 *  ============================================================
 *                   		  @IMPORTS
 *  ============================================================
 */
const jwt = require('jsonwebtoken')
const { User, Otp } = require('../../../models')
const { ErrorResponse, ImageManipulation, fieldFilter } = require('../../../utils')
const { asyncHandler } = require('../../../middlewares')
/**
 *  ============================================================
 *                   	@CUSTOM_METHODS
 *  ============================================================
 */
/**
 * takes user id as payload returns token
 * @param {*} id
 * @returns token
 */
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}
/**
 * this method returns response with user data and token
 * @param {*} user
 * @param {*} statusCode
 * @param {*} res
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.getDataValue('id'))

  res.status(statusCode).json({
    success: true,
    data: user,
    token
  })
}
/**
 *  ============================================================
 *                   	@AUTH_CONTROLLERS
 *  ============================================================
 */
/**
 *	 @desc    sends one-time-password a.k.a. verification-code
 *	 @route   POST api/v1/auth/sendOtp
 *	 @access  public
 */
exports.sendOtp = asyncHandler(async (req, res, next) => {
  const { verification_code, phoneNumber } = req.body
  // send otp with verified code, phoneNumber and with time its requested
  const oldOtp = await Otp.findOne({ where: { phoneNumber } })
  if (oldOtp) {
    await oldOtp.destroy()
  }
  const otp = await Otp.create({
    verification_code,
    phoneNumber
  })

  res.status(201).json({
    success: true,
    data: otp
  })
})
/**
 *	 @desc    sign up a user
 *	 @route   POST api/v1/auth/signup
 *	 @access  public
 */
exports.signUp = asyncHandler(async (req, res, next) => {
  const { name, phoneNumber, password, verification_code } = req.body
  // // check if verification code is valid
  // const otp = await Otp.findOne({ where: { phoneNumber } })
  // // this checks if otp exists and is its verification code is same with requested one
  // if (!otp || !(await otp.codeValidation(verification_code)))
  //   return next(new ErrorResponse(`Invalid verification code`, 401))
  // // this checks if verification code is not expired
  // const currentTime = new Date()
  // if (otp.isVerifiedTime(currentTime))
  //   return next(new ErrorResponse('Verification time is up. Please try again!', 401))
  // if * goes ok, then it creates new user

  const user = await User.create({ name, phoneNumber, password })

  createSendToken(user, 201, res)
})
/**
 *	 @desc    login user
 *	 @route   POST api/v1/auth/login
 *	 @access  public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { phoneNumber, password } = req.body
  // checks if phoneNumber and password fields present
  if (!phoneNumber || !password)
    return next(new ErrorResponse('Please provide phone number and password', 400))
  // searchs for user with requested phoneNumber
  const user = await User.findOne({
    where: { phoneNumber }
  })
  // checks whether password is correct
  if (!user || !(await user.passwordValidation(password)))
    return next(new ErrorResponse(`Invalid credentials`, 401))
  // loggedOut field is set to false (which means logged in)
  await user.update({ loggedOut: false })
  await user.save()

  createSendToken(user, 200, res)
})
/**
 *	 @desc    logout user
 *	 @route   POST api/v1/auth/logout
 *	 @access  private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // update loggedOut field to true (which makes token invalid for further uses)
  await req.user.update({ loggedOut: true })

  res.status(204).end()
})
/**
 *	 @desc    change password
 *	 @route   PUT api/v1/auth/changePassword
 *	 @access  private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body
  // checks old password whether its correct
  if (!(await req.user.passwordValidation(oldPassword)))
    return next(new ErrorResponse('Not a valid password', 400))
  // updates to new password and sets passwordChangedAt field to current time (and makes old token invalid for further uses)
  await req.user.update({ password: newPassword, passwordChangedAt: Date.now() })
  res.status(204).end()
})
/**
 *	 @desc    get user info
 *	 @route   GET api/v1/auth/getMe
 *	 @access  private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user
  })
})
/**
 *	 @desc    change user info
 *	 @route   PUT api/v1/auth/changeMe
 *	 @access  private
 */
exports.changeMe = asyncHandler(async (req, res, next) => {
  // black listed fields are filtered
  fieldFilter(req.body, ['password', 'passwordChangedAt', 'role', 'loggedOut'])
  // if file is uploaded then image field name added to db
  if (req.file) req.body.image = `${req.file.destination}/${req.file.filename}`

  await req.user.update(req.body)
  // if everything goes ok then new image is uploaded
  if (req.file) await new ImageManipulation(req.file).readAndWrite()

  res.status(200).json({
    success: true,
    data: req.user
  })
})
/**
 *	 @desc    delete profile image
 *	 @route   DELETE api/v1/auth/deleteImage
 *	 @access  private
 */
exports.deleteImage = asyncHandler(async (req, res, next) => {
  await req.user.update({ image: null })

  res.status(204).end()
})
/**
 *  ============================================================
 *                   	@AUTH_MIDDLEWARES
 *  ============================================================
 */
/**
 *	 @desc    accessRestriction middleware
 *	 @route   *
 *	 @access  *
 */
exports.accessRestriction = (...userRoles) =>
  asyncHandler(async (req, res, next) => {
    let token
    // checks authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
      token = req.headers.authorization.split(' ')[1]
    if (!token) return next(new ErrorResponse('You are not logged in', 401))
    // verifies token validity
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    // gets user by id
    const currentUser = await User.findByPk(decoded.id)
    if (!currentUser) return next(new ErrorResponse('User does not exist', 403))
    // if user changed password after token issued time it wont allow to pass this middleware
    if (currentUser.passwordChangedAfter(decoded.iat))
      return next(new ErrorResponse('User changed password. Please log in again!', 401))
    if (currentUser.isLoggedOut()) return next(new ErrorResponse('Log in to have access', 401))
    // if passes from above logics then user is written to request object for further access
    req.user = currentUser
    // this checks for user roles
    if (userRoles != 'all' && !userRoles.includes(currentUser.getDataValue('role')))
      return next(new ErrorResponse('You are not authorized to access this route', 403))
    // if * ok you can go next
    next()
  })
/**
 *	 @desc    isParamUserYou middleware
 *	 @route   *
 *	 @access  for Partner's and User's routes
 */
exports.doubleCheck = asyncHandler(async (req, res, next) => {
  // for role === user
  if (req.user.getDataValue('role') === 'user') {
    if (req.user.getDataValue('id') !== Number(req.params.userId))
      return next(new ErrorResponse('You are not authorized to access this route', 401))
  }
  // for role === partner
  if (req.user.getDataValue('role') === 'partner') {
    if (req.user.getDataValue('id') !== Number(req.params.partnerId))
      return next(new ErrorResponse('You are not authorized to access this route', 401))
  }

  next()
})
