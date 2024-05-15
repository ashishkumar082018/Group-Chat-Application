const { DataTypes } = require("sequelize");
const database = require("../utils/database");

const User = database.define("User", {
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    userPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = User;
