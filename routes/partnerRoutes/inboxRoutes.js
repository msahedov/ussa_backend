const express = require('express');
const { inboxControllers } = require('../../controllers').api.v1.partner;
const { authControllers } = require('../../controllers').api.v1;

const router = express.Router();

// Auth middleware
router.use(authControllers.accessRestriction('partner'));

router
  .route('/:partnerId/inbox')
  .get(authControllers.doubleCheck, inboxControllers.getAllIncomeMessages)
  .post(authControllers.doubleCheck, inboxControllers.createMessage);

router.get('/:partnerId/inbox/sentMessages', authControllers.doubleCheck, inboxControllers.getAllSentMessages);

router
  .route('/:partnerId/inbox/:messageId')
  .get(authControllers.doubleCheck, inboxControllers.getIncomeMessageById)
  .delete(authControllers.doubleCheck, inboxControllers.deleteMessageById);


router.get('/:partnerId/inbox/sentMessages/:messageId', authControllers.doubleCheck, inboxControllers.getSentMessageById);


module.exports = router;
