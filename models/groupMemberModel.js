const { DataTypes } = require("sequelize");
const database = require("../utils/database");

const GroupMember = database.define('GroupMember', {
    memberId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = GroupMember;
