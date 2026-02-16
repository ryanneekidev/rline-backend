const authController = require("../../controllers/authentication/authentication.controller");
const router = require("express").Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh", authController.refresh);

module.exports = router;