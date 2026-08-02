const Notification = require('../models/Notification');

/**
 * Create a notification for a specific user.
 * Used internally by other controllers to generate notifications on key events.
 *
 * @param {Object} opts
 * @param {string} opts.recipientId - User ObjectId
 * @param {string} opts.type        - 'appointment' | 'feedback' | 'prescription' | 'system'
 * @param {string} opts.title       - Short title
 * @param {string} opts.message     - Descriptive message body
 * @param {string} [opts.link]      - Optional frontend route to navigate to
 */
const createNotification = async ({ recipientId, type, title, message, link = '' }) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
    });
  } catch (err) {
    // Notification creation should never block the main flow
    console.error(`[Notification Error] ${err.message}`);
  }
};

module.exports = { createNotification };
