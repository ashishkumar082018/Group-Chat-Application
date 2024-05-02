const path = require("path");
const bcrypt = require("bcrypt");
const rootDir = require("../util/path");

const User = require("../models/userModel");
const database = require("../util/database");

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
    const existingUser = await User.findOne({
      where: { email: email },
    });

    // If user already exists, return an error
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    //if user don't exists then create an new user
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

// for login page

exports.getLogin = (req, res, next) => {
  res.sendFile(path.join(rootDir, "public", "login.html"));
};

function generateAccessToken(id, email) {
  return jwt.sign({ id: id, email: email }, process.env.ACCESS_TOKEN_SECRET);
}

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      const error = new Error("User not found, Please Signup");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid password, Please Try Again");
      error.statusCode = 401;
      throw error;
    }
    res.status(200).send({
      message: "User successfully Logged In",
      token: generateAccessToken(user.id, user.email),
    });
  } catch (err) {
    if (err.statusCode != 500) {
      res.status(err.statusCode).send({ error: err.message });
    } else {
      console.log(err);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
};
