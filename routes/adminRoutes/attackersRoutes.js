const express = require('express')

const { getAllAttackers, updateAttackerStatus, createAttacker, deleteAttacker } =
    require('../../controllers').api.v1.admin.attackersControllers
const { accessRestriction } = require('../../controllers').api.v1.authControllers

const router = express.Router()
/**
 * @access private
 */
router.use(accessRestriction('admin'))

router.get('/', getAllAttackers)
router.post('/create', createAttacker)
router.route('/:attackerId/delete').delete(deleteAttacker)
router.route('/:attackerId/update').put(updateAttackerStatus)

module.exports = router
