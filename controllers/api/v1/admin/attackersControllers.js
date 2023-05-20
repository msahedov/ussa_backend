const { Attacker } = require("../../../../models")
const { ApiFeatures } = require('../../../../utils')
const { asyncHandler } = require('../../../../middlewares')


/**
 *	 @desc    get all attackers
 *	 @route   GET api/v1/admin/attackers
 *	 @access  admin
 */
exports.getAllAttackers = asyncHandler(async (req, res, next) => {
    const { count, rows } = await new ApiFeatures(Attacker, { limit: 10, ...req.query })
        .getAllItemsOfModel()

    res.status(200).set('X-Total-Count', count).json({
        success: true,
        data: rows
    })
})

/**
 *	 @desc    create attacker
 *	 @route   POST api/v1/admin/attackers/create
 *	 @access  admin
 */
exports.createAttacker = asyncHandler(async (req, res, next) => {


    const attacker = await Attacker.create(req.body)

    res.status(201).json({
        success: true,
        data: attacker
    })
})

/**
 *	 @desc    change attacker status
 *	 @route   PUT api/v1/admin/attackers/:attackerId/update
 *	 @access  admin
 */
exports.updateAttackerStatus = asyncHandler(async (req, res, next) => {
    const { attackerId } = req.params
    // get requested attacker
    const attacker = await Attacker.findByPk(attackerId)
    if (!attacker) return next(new ErrorResponse(`No attacker found with ${attackerId} id`, 404))


    await attacker.update(req.body)
    await attacker.save()

    res.status(200).json({
        success: true,
        data: attacker
    })
})



/**
 *	 @desc    delete attacker 
 *	 @route   PUT api/v1/admin/attackers/:attackerId/delete
 *	 @access  admin
 */
exports.deleteAttacker = asyncHandler(async (req, res, next) => {
    const { attackerId } = req.params
    // get required attacker by id
    const attacker = await Attacker.findByPk(attackerId)
    if (!attacker) return next(new ErrorResponse(`No attacker found with id ${productId}`, 404))

    await attacker.destroy()

    // no-content is returned
    res.status(204).end()
})




