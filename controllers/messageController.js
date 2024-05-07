const path = require("path");
const fs = require("fs");
const Message = require("../models/messagesModel");
const rootDir = require("../utils/path");
const database = require("../utils/database");

exports.getMessages = (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'message.html'));
};

exports.postMessages = async (req, res) => {
    const t = await database.transaction();
    try {
        const message = req.body.message;
        const sender = req.user.name;
        const userId = req.user.id;
        await Message.create({ message: message, sender: sender, UserId: userId });
        await t.commit();
        res.status(200).json({ message: 'Message sent successfully' });
    }
    catch (err) {
        console.error(err.errors[0].message);
        await t.rollback();
        res.status(500).json({ error: err.errors[0].message });
    }
}

exports.getAllMessages = async (req, res, next) => {
    try {
        let messages = await Message.findAll();
        messages = messages.map(message => {
            if (req.user.name == message.sender) {
                message.sender = `You`;
            }
            return message;
        });
        res.status(200).json({ message: messages });
    } catch (err) {
        console.error(err.errors[0].message);
        res.status(500).json({ error: err.errors[0].message });
    }
}