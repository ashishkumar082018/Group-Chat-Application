const Express = require("express");
const UserController = require("../controllers/userController");

const router = Express.Router();

router.post("/signup", UserController.postSignup);

router.post("/login", UserController.postLogin);

module.exports = router;
