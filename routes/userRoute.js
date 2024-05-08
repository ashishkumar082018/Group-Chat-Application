const Express = require("express");
const UserController = require("../controllers/userController");
const authenticate = require("../middlewares/auth");

const router = Express.Router();

router.get("/signup", UserController.getSignup);
router.post("/signup", UserController.postSignup);
router.get("/login", UserController.getLogin);
router.post("/login", UserController.postLogin);

router.get("/online-users", authenticate, UserController.getOnlineUsers);

router.post("/set-offline", authenticate, UserController.setOfflineUser);

router.post("/set-online", authenticate, UserController.setOnlineUser);

module.exports = router;
