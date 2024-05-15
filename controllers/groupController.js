const GroupMember = require("../models/groupMemberModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const database = require("../utils/database");

exports.deleteGroup = async (req, res, next) => {
    const transaction = await database.transaction();
    try {
        const groupId = req.params.groupId;
        const group = await Group.findByPk(groupId);
        const adminUser = await group.getUsers({
            where: { id: req.user.id },
            through: { where: { isAdmin: true } }
        });
        if (adminUser.length == 0 || adminUser[0].id != req.user.id) {
            return res.status(401).json({ error: 'You are not admin' });
        }
        await group.destroy({ transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (err) {
        await transaction.rollback();
        console.error(err.errors[0].message);
        res.status(500).json({ error: err.errors[0].message });
    }
}

exports.editGroup = async (req, res, next) => {
    const transaction = await database.transaction();
    try {
        const groupId = req.params.groupId;
        const group = await Group.findByPk(groupId);
        const adminUser = await group.getUsers({
            where: { id: req.user.id },
            through: { where: { isAdmin: true } }
        });
        if (adminUser.length == 0 || adminUser[0].id != req.user.id) {
            return res.status(401).json({ error: 'You are not admin' });
        }

        // Update the group name
        await group.update({ groupName: req.body.name }, { transaction });

        // Update group members
        const members = req.body.members;
        for (const member of members) {
            const user = await User.findOne({ where: { userEmail: member } });
            if (!user) {
                await transaction.rollback();
                return res.status(500).json({ error: `User with email ${member} not found` });
            }
            await GroupMember.findOrCreate({ where: { GroupId: groupId, UserId: user.id }, transaction });
        }

        await transaction.commit();
        res.status(200).json({ message: 'Group edited successfully' });
    } catch (err) {
        await transaction.rollback();
        console.error(err.errors[0].message);
        res.status(500).json({ error: err.errors[0].message });
    }
}


exports.deleteMember = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        const group = await Group.findByPk(groupId);
        const adminUser = await group.getUsers({
            where: { id: req.user.id },
            through: { where: { isAdmin: true } }
        });
        if (adminUser.length == 0 || adminUser[0].id != req.user.id) {
            return res.status(401).json({ error: 'You are not admin' });
        }
        await GroupMember.destroy({ where: { GroupId: groupId, UserId: userId } });
        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (err) {
        console.error(err.errors[0].message);
        res.status(500).json({ error: err.errors[0].message });
    }
}

exports.makeAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        const group = await Group.findByPk(groupId);
        const adminUser = await group.getUsers({
            where: { id: req.user.id },
            through: { where: { isAdmin: true } }
        });
        if (adminUser.length == 0 || adminUser[0].id != req.user.id) {
            return res.status(401).json({ error: 'You are not admin' });
        }
        await GroupMember.update({ isAdmin: true }, { where: { GroupId: groupId, UserId: userId } });
        res.status(200).json({ message: 'Member made admin successfully' });
    } catch (err) {
        console.error(err.errors[0].message);
        res.status(500).json({ error: err.errors[0].message });
    }
}
