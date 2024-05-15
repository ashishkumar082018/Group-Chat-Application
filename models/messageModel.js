const { DataTypes } = require("sequelize");
const database = require("../utils/database");

const Message = database.define("Message", {
    messageContent: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    senderName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = Message;
