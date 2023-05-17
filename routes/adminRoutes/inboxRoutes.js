const express = require('express');
const { inboxControllers } = require('../../controllers').api.v1.admin;
const { authControllers } = require('../../controllers').api.v1;

const router = express.Router();

router.use(authControllers.accessRestriction('admin'));

router
  .route('/')
  .get(inboxControllers.getAllIncomeMessages)
  .post(inboxControllers.createMessage);

router.get('/sentMessages', inboxControllers.getAllSentMessages);

router
  .route('/:messageId')
  .get(inboxControllers.getIncomeMessageById)
  .delete(inboxControllers.deleteMessageById);

router.get('/sentMessages/:messageId', inboxControllers.getSentMessageById);

// router
//   .route('/:userId')
//   .get(usersControllers.getUserById)
//   .put(usersControllers.updateUserById)
//   .delete(usersControllers.deleteUserById);

module.exports = router;
