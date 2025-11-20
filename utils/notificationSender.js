// backend/utils/notificationSender.js
const admin = require('firebase-admin');
const User = require('../models/userModel');

const sendNotificationToUser = async (userId, title, body) => {
  try {
    // 1. Find the user to get their FCM Token
    const user = await User.findById(userId);
    
    if (!user || !user.fcmToken) {
      console.log(`No FCM token found for user: ${userId}`);
      return;
    }

    // 2. Construct the message
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: user.fcmToken,
    };

    // 3. Send via Firebase Admin
    await admin.messaging().send(message);
    console.log(`Notification sent to ${user.name}`);
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = { sendNotificationToUser };