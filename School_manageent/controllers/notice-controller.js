const Notice = require('../models/noticeSchema.js');
const PushToken = require('../models/pushTokenSchema');
const { sendPushNotification } = require('./push-notification-controller');

const noticeCreate = async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            type: req.body.noticeTo,
            school: req.body.adminID
        })
        const result = await notice.save()

        // Send push notification after creating a notice
        const allPushTokens = await PushToken.find({}, 'token');
        const recipientTokens = allPushTokens.map(tokenDoc => tokenDoc.token);

        if (recipientTokens.length > 0) {
            const notificationTitle = "New Notice: " + req.body.title;
            const notificationBody = req.body.description;
            const notificationData = { noticeId: result._id.toString(), type: "new_notice" };

            // Call the sendPushNotification function (assuming it's in the same controller or imported)
            // Note: This is a simplified call. In a real app, you might want to handle the response/errors more robustly.
            await sendPushNotification({ body: { recipientTokens, title: notificationTitle, body: notificationBody, data: notificationData } }, {});
        }

        res.send(result)
    } catch (err) {
        res.status(500).json(err);
    }
};

const noticeList = async (req, res) => {
    try {
        let notices = await Notice.find({ school: req.params.id })
        if (notices.length > 0) {
            res.send(notices)
        } else {
            res.send({ message: "No notices found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteNotices = async (req, res) => {
    try {
        const result = await Notice.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No notices found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

module.exports = { noticeCreate, noticeList, updateNotice, deleteNotice, deleteNotices };