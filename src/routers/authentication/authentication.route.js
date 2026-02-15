const authController = require("../../controllers/authentication/authentication.controller");
const router = require("express").Router();

router.post("/login", authController.login);

module.exports = router;