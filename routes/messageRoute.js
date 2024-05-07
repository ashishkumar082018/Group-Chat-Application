const express = require("express");
const messageController = require("../controllers/messageController");
const authenticate = require("../middlewares/auth");
const router = express.Router();
router.use(express.json());

router.get('/',authenticate, messageController.getMessages);
router.post('/',authenticate, messageController.postMessages);
router.get('/all',authenticate, messageController.getAllMessages);

module.exports = router;