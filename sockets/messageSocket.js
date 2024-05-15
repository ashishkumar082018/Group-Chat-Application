const Message = require("../models/messageModel");
const database = require("../utils/database");

exports.postMessages = async (socket, message) => {
    const { userName, id } = socket.user;
    // console.log(socket.user);
    const t = await database.transaction();
    try {
        await Message.create({ messageContent: message, senderName: userName, UserId: id });
        await t.commit();
        socket.emit("post-group-message", { messageContent: message, senderName: userName, userId: id });
    } catch (error) {
        console.error(error.message);
        await t.rollback();
    }
};

exports.getAllMessages = async (socket) => {
    const { userName } = socket.user;
    try {
        const result = await Message.findAndCountAll({
            where: { GroupId: null },
        });
        const totalCount = result.count;
        const offset = Math.max(totalCount - 10, 0);
        const messages = await Message.findAll({
            where: { GroupId: null },
            offset: offset,
            limit: 10,
        });
        messages.forEach((message) => {
            if (message.senderName == userName) {
                message.senderName = "You";
            }
            else{
                message.senderName = message.senderName;
            }
        });
        socket.broadcast.emit("user-joined", { username: socket.user.userName });
        socket.emit("all-messages", messages);
    } catch (err) {
        console.log(err);
    }
};
