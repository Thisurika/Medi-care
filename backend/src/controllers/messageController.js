const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, message } = req.body;

    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver user not found' });
    }

    let attachmentPath = '';
    if (req.file) {
      attachmentPath = `/uploads/attachments/${req.file.filename}`;
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiver._id,
      message: message || '',
      attachment: attachmentPath,
      read_status: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name role profile_photo')
      .populate('receiver', 'name role profile_photo');

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message thread with a specific user
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name role profile_photo')
      .populate('receiver', 'name role profile_photo')
      .sort({ createdAt: 1 });

    // Automatically mark unread incoming messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, read_status: false },
      { $set: { read_status: true } }
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active conversation threads for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversationsList = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all messages sent or received by user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email role profile_photo')
      .populate('receiver', 'name email role profile_photo')
      .sort({ createdAt: -1 });

    const partnersMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === userId.toString();
      const partner = isSender ? msg.receiver : msg.sender;

      if (!partnersMap.has(partner._id.toString())) {
        partnersMap.set(partner._id.toString(), {
          partner,
          lastMessage: msg,
          unreadCount: !isSender && !msg.read_status ? 1 : 0,
        });
      } else {
        const existing = partnersMap.get(partner._id.toString());
        if (!isSender && !msg.read_status) {
          existing.unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(partnersMap.values());

    res.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/read/:senderId
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      { sender: req.params.senderId, receiver: req.user._id, read_status: false },
      { $set: { read_status: true } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
  markAsRead,
};
