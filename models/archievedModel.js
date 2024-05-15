const { DataTypes } = require("sequelize");
const database = require("../utils/database");

const Archived = database.define("Archived", {
    messageContent: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = Archived;
