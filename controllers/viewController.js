const path = require('path');

const rootDir = require('../utils/path');

exports.getGroupList = async (req, res, next) => {
    res.sendFile(path.join(rootDir, "public", "groups.html"));
}

exports.getSignup = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'public', 'signup.html'));
};

exports.getLogin = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'public', 'login.html'));
};

exports.getMessages = (req, res, next) => {
    res.sendFile(path.join(rootDir, "public", "message.html"));
}

exports.getGroupPage = async (req, res, next) => {
    res.sendFile(path.join(rootDir, "public", "singleGroupPage.html"));
}