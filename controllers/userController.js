const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const database = require("../utils/database");

exports.postSignup = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const { name, email, phone, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ where: { userEmail: email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create a new user
    await User.create({ userName: name, userEmail: email, userPhone: phone, userPassword: hashedPassword }, { transaction });
    await transaction.commit();
    res.status(200).send({ message: "User Created Successfully" });
  } catch (err) {
    console.error(err);
    await transaction.rollback();
    res.status(500).send({ error: "An error occurred while creating the user" });
  }
};

function generateAccessToken(id, email) {
  return jwt.sign({ id: id, userEmail: email }, process.env.ACCESS_TOKEN_SECRET);
}

exports.postLogin = async (req, res, next) => {
  const transaction = await database.transaction();
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { userEmail: email } });
    if (!user) {
      return res.status(404).json({ error: "User not found, Please Signup" });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.userPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password, Please Try Again" });
    }

    await transaction.commit();

    // Generate JWT token
    const token = generateAccessToken(user.id, user.userEmail);
    res.status(200).send({ message: "User successfully Logged In", token });
  } catch (err) {
    await transaction.rollback();
    if (err.statusCode && err.statusCode !== 500) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
