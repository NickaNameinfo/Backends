const PushToken = require('../models/pushTokenSchema');
const { Expo } = require('expo-server-sdk');

const sendPushNotification = async (recipientTokens, title, body, data) => {
    try {
        if (!recipientTokens || !Array.isArray(recipientTokens) || recipientTokens.length === 0) {
            console.warn('No recipient tokens provided for push notification.');
            return { success: false, message: 'No recipient tokens' };
        }

        let expo = new Expo();
        let messages = [];

        for (let token of recipientTokens) {
            if (!Expo.isExpoPushToken(token)) {
                console.error(`Push token ${token} is not a valid Expo push token.`);
                continue;
            }

            messages.push({
                to: token,
                sound: 'default',
                title: title || 'New Notification',
                body: body || 'You have a new message',
                data: data || { withSome: 'data' },
            });
        }

        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending push notification chunk:', error);
            }
        }
        return { success: true, tickets };

    } catch (error) {
        console.error('Server error sending push notification:', error);
        return { success: false, error };
    }
};

exports.sendPushNotificationHelper = sendPushNotification;

exports.savePushToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Push token is required' });
        }

        let pushToken = await PushToken.findOne({ token });

        if (pushToken) {
            return res.status(200).json({ message: 'Token already registered' });
        }

        pushToken = new PushToken({ token });
        await pushToken.save();

        res.status(201).json({ message: 'Push token registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.sendPushNotification = async (req, res) => {
    const { recipientTokens, title, body, data } = req.body;
    const result = await sendPushNotification(recipientTokens, title, body, data);
    if (result.success) {
        res.status(200).json({ message: 'Notifications sent', tickets: result.tickets });
    } else {
        res.status(500).json({ message: 'Server error', error: result.error });
    }
};