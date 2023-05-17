const { Striker } = require("../../../../models")
const { ApiFeatures } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')

/**
 *	 @desc    add striker
 *	 @route   POST api/v1/admin/addStriker
 *	 @access  admin
 */
exports.addStriker = asyncHandler(async (req, res, next) => {
    const remoteAddress = req.connection.remoteAddress
    const currentTime = Date.now()

    const striker = await Striker.create({ remoteAddress, currentTime })
    return striker;
})

/**
 *	 @desc    get all strikers
 *	 @route   GET api/v1/admin/getAllStrikers
 *	 @access  admin
 */
exports.getAllStrikers = asyncHandler(async (req, res, next) => {
    const { count, rows } = await new ApiFeatures(Striker, { limit: 10, ...req.query })
        .getAllItemsOfModel()

    res.status(200).set('X-Total-Count', count).json({
        success: true,
        data: rows
    })
})