const { Inbox, User } = require('../../../../models');
const { ApiFeatures, ErrorResponse, fileCope } = require('../../../../utils');
const { asyncHandler } = require('../../../../middlewares');

//  ============================================================
//                      ADMIN CONTROLLERS
//  ============================================================
// @desc    gets all messages from database
// @route   GET api/v1/admin/inbox
// @access  private ADMIN
exports.getAllIncomeMessages = asyncHandler(async (req, res, next) => {
  const { count, rows } = await new ApiFeatures(Inbox, req.query, req.user.getDataValue('role'), [{
    model: User,
    as: 'SendFrom'
  }]).filter({
    limit: 10,
    sendTo: req.user.getDataValue('id'),
    active: {
      receiver: true
    }
  });

  // console.log(messages.getDataValue('active'));

  res.status(200).json({
    success: true,
    result: count,
    data: rows
  });
});
// @desc    gets all sent messages by me
// @route   GET api/v1/admin/inbox/sentMessages
// @access  private ADMIN
exports.getAllSentMessages = asyncHandler(async (req, res, next) => {

  const { count, rows } = await new ApiFeatures(Inbox, req.query, req.user.getDataValue('role'), [{
    model: User,
    as: 'SendTo'
  },]).filter({
    limit: 10,
    userId: req.user.getDataValue('id'),
    active: {
      sender: true
    }
  });

  res.status(200).json({
    success: true,
    result: count,
    data: rows
  });
});
// @desc    get income messages by uuid
// @route   GET api/v1/admin/inbox/:messageId
// @access  private ADMIN
exports.getIncomeMessageById = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;
  const message = await Inbox.findOne({
    where: { id: messageId },
    include: {
      model: User,
      as: 'SendFrom'
    }
  });


  if (message.getDataValue('sendTo') !== req.user.getDataValue('id')) return next(new ErrorResponse('You are not authorized to access this route', 403));
  if (!message.isMessageRead()) message.readMessage();

  res.status(201).json({
    success: true,
    data: message
  })
});

// @desc    get sent message by id
// @route   GET api/v1/admin/inbox/sentMessages/:messageId
// @access  private ADMIN 
exports.getSentMessageById = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;
  const message = await Inbox.findOne({
    where: { id: messageId },
    include: {
      model: User,
      as: 'SendTo'
    }
  });

  if (!message) return next(new ErrorResponse('No message with such id', 404));
  if (message.getDataValue('userId') !== req.user.getDataValue('id')) return next(new ErrorResponse('You are not authorized to access this route', 403));

  res.status(201).json({
    success: true,
    data: message
  })
});

// @desc    create new messages and sent it
// @route   POST api/v1/admin/inbox 
// @access  private ADMIN
exports.createMessage = asyncHandler(async (req, res, next) => {
  const { sendTo } = req.body;

  let userToBeSended;
  if (req.user.getDataValue('role') == 'partner') {
    userToBeSended = await User.findOne({ where: { role: 'admin' } });
  } else if (req.user.getDataValue('role') == 'admin') {
    userToBeSended = await User.findOne({
      where: { uuid: sendTo }
    });
  } else {
    return next(new ErrorResponse('You are not authorized to send message', 403));
  }

  const message = await Inbox.create({ ...req.body, userId: req.user.getDataValue('id'), sendTo: userToBeSended.getDataValue('id') });

  res.status(201).json({
    success: true,
    data: message
  })
});

// @desc    delete message by uuid
// @route   DELETE api/v1/admin/inbox/:messageId  
// @access  private ADMIN
exports.deleteMessageById = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Inbox.findOne({
    where: { id: messageId }
  });

  if (message.getDataValue('userId') === req.user.getDataValue('id')) {
    message.deleteBySender();
  } else if (message.getDataValue('sendTo') === req.user.getDataValue('id')) {
    message.deleteByReceiver();
  } else {
    return next(new ErrorResponse('You are not authorized to access this route', 403));
  }

  if (message.isInActive()) await message.destroy();

  res.status(200).json({
    success: true,
    data: []
  })

})

