const PushToken = require('../models/pushTokenSchema');
const { Expo } = require('expo-server-sdk');

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
    try {
        const { recipientTokens, title, body, data } = req.body;

        if (!recipientTokens || !Array.isArray(recipientTokens) || recipientTokens.length === 0) {
            return res.status(400).json({ message: 'Recipient tokens are required and must be an array' });
        }

        if (!Expo.isExpoPushToken(recipientTokens[0])) {
            return res.status(400).json({ message: 'Invalid Expo push token format' });
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
                console.error(error);
            }
        }

        res.status(200).json({ message: 'Notifications sent', tickets });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};