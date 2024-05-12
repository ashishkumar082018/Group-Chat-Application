const express = require("express");

const viewsController = require("../controllers/viewController");

const router = express.Router();

router.get("/", viewsController.getGroupList);

router.get("/signup", viewsController.getSignup);

router.get("/login", viewsController.getLogin);

router.get("/global", viewsController.getMessages);

router.get("/group/:groupId", viewsController.getGroupPage);

module.exports = router;