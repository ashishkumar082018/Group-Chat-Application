const User = require("../models/userModel")
const GroupMember = require("../models/groupMemberModel");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const database = require("../utils/database");

exports.createGroup = async (io, socket, groupData) => {
    const t = await database.transaction();
    try {
        // console.log(groupData);
        const group = await Group.create({ groupName: groupData.name}, { transaction: t });
        await group.addUser(socket.user, { through: { isAdmin: true }, transaction: t });
        for (const member of groupData.members) {
            const user = await User.findOne({ where: { userEmail: member } });
            if (!user) {
                throw new Error("User not found");
            }
            await group.addUser(user, { transaction: t });
        }
        await t.commit();
        io.emit("group-created", group);
    } catch (err) {
        if (err.message === "User not found") {
            socket.emit("user-not-found");
        }
        await t.rollback();
    }
};

exports.getAllGroups = async (socket, cb) => {
    try {
        const UserId = socket.user.id;
        const user = await User.findByPk(UserId);
        const groups = await user.getGroups();
        return cb(groups);
    }
    catch (err) {
        console.error(err);
    }
};

exports.getGroupMessages = async (socket, groupId) => {
    try {
        const userId = socket.user.id;
        // console.log(socket);
        const groupMember = await GroupMember.findOne({ where: { GroupId: groupId, UserId: userId } });
        if (!groupMember) {
            socket.emit("not-member");
            return;
        }
        const messages = await Message.findAll({ where: { GroupId: groupId } });
        messages.forEach((message) => {
            if (message.senderName == socket.user.userName) {
                message.senderName = "You";
            }
            else{
                message.senderName = message.senderName;
            }
        });
        socket.emit("get-group-messages", messages);
    }
    catch (err) {
        console.error(err);
    }
};

exports.getGroupMembers = async (socket, groupId) => {
    try {
        const userId = socket.user.id;
        const groupMember = await GroupMember.findOne({ where: { GroupId: groupId, UserId: userId } });
        if (!groupMember) {
            socket.emit("not-member");
            return;
        }
        
        const group = await Group.findByPk(groupId);
        const isAdmin = groupMember.isAdmin;
        const members = await group.getUsers();
        // console.log(members);
        const memberInfo = members.reduce((acc, member) => {
            if (socket.user.userName !== member.userName) {
                acc[member.id] = member.userName;
            } else {
                acc[member.id] = "You";
            }
            return acc;
        }, {});

        const memberEmails = members
            .filter(member => member.userEmail !== socket.user.userEmail)
            .map(member => member.userEmail);

        socket.emit("group-members", memberInfo, isAdmin, memberEmails);
    } catch (err) {
        console.error(err);
    }
}


exports.postMessages = async (socket, message, groupId) => {
    const { userName,id , userId } = socket.user;
    // console.log(id);
    const t = await database.transaction();
    try {
        await Message.create({ messageContent : message, senderName : userName, UserId : id, GroupId : groupId });
        await t.commit();
        socket.to(groupId).emit("post-group-message", { messageContent: message, senderName: userName, id : userId, GroupId: groupId });
    } catch (error) {
        console.error(error.message);
        await t.rollback();
    }
};