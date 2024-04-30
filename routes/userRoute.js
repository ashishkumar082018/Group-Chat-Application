const Express = require("express");
const UserController = require("../controllers/userController");

const router = Express.Router();

router.get("/signup", UserController.getSignup);
router.post("/signup", UserController.postSignup);
router.get("/login", UserController.getLogin);

module.exports = router;
