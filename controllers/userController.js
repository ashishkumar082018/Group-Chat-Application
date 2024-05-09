const path = require("path");
const bcrypt = require("bcrypt");
const rootDir = require("../utils/path");
const User = require("../models/userModel");
const database = require("../utils/database");
const jwt = require("jsonwebtoken");

// for signup page

exports.getSignup = (req, res, next) => {
  res.sendFile(path.join(rootDir, "public", "signup.html"));
};

exports.postSignup = async (req, res, next) => {
  const t = await database.transaction();
  try {
    const { name, email, phone, password } = req.body;
    console.log("Password : ", req.body.password); // Log the received password
    const modifiedPassword = bcrypt.hashSync(password, 10);
    console.log("Modified password:", modifiedPassword); // Log modified password

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    //if user don't exists then create an new user
    await User.create({ name: name, email: email, phone: phone, password: modifiedPassword });
    await t.commit();
    res.status(200).send({ message: "User Created Successfully" });
  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).send({ error: "An error occurred while creating the user" });
  }
};

// for login page

exports.getLogin = (req, res, next) => {
  res.sendFile(path.join(rootDir, "public", "login.html"));
};

function generateAccessToken(id, email) {
  return jwt.sign({ id: id, email: email }, process.env.ACCESS_TOKEN_SECRET);
}

exports.postLogin = async (req, res, next) => {
  const t = await database.transaction();
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ error: "User not found, Please Signup" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password, Please Try Again" });
    }
    await t.commit();
    const token = generateAccessToken(user.id, user.email);
    console.log("token --- " ,token);
    res.status(200).send({ message: "User successfully Logged In", token});
  } catch (err) {
    await t.rollback();
    if (err.statusCode && err.statusCode !== 500) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.getOnlineUsers = async (req, res, next) => {
  try {
      const users = await User.findAll({ where: { loggedIn: true } });
      const names = users.map(user => {
          if (req.user.name == user.name) {
              return `You`;
          }
          else {
              return user.name;
          }
      });
      res.status(200).json({ message: names });
  }
  catch (err) {
      console.error(err.errors[0].message);
      res.status(500).json({ error: err.errors[0].message });
  }
}

exports.setOfflineUser = async (req, res, next) => {
  const t = await database.transaction();
  try {
      req.user.loggedIn = false;
      await req.user.save();
      await t.commit();
      res.status(200).json({ message: "User is offline" });
  } catch (err) {
      await t.rollback();
      console.error(err.errors[0].message);
      res.status(500).json({ error: err.errors[0].message });
  }
}

exports.setOnlineUser = async (req, res, next) => {
  const t = await database.transaction();
  try {
      req.user.loggedIn = true;
      await req.user.save();
      await t.commit();
      res.status(200).json({ message: "User is online" });
  } catch (err) {
      await t.rollback();
      console.error(err.errors[0].message);
      res.status(500).json({ error: err.errors[0].message });
  }
}