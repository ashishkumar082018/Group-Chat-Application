const path = require("path");
const bcrypt = require("bcrypt");
const rootDir = require("../util/path");

const User = require("../models/userModel");
const database = require("../util/database");

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
    await User.create({
      name: name,
      email: email,
      phone: phone,
      password: modifiedPassword,
    });
    await t.commit();
    res.status(200).send({ message: "User Created Successfully" });
  } catch (err) {
    console.error(err);
    await t.rollback();
    res
      .status(500)
      .send({ error: "An error occurred while creating the user" });
  }
};

exports.getLogin = (req, res, next) => {
  res.sendFile(path.join(rootDir, "public", "login.html"));
};
