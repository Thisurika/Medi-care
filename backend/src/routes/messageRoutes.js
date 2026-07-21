const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversationsList,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/', upload.single('attachment'), sendMessage);
router.get('/conversations', getConversationsList);
router.get('/conversation/:userId', getConversation);
router.put('/read/:senderId', markAsRead);

module.exports = router;
