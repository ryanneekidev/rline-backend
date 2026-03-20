const authController = require("../../controllers/authentication/authentication.controller");
const { loginLimiter, registerLimiter, refreshLimiter } = require("../../middleware/rateLimiter");
const { loginValidators, registerValidators } = require("../../middleware/validators/auth.validators");
const router = require("express").Router();

router.post("/login", loginLimiter, loginValidators, authController.login);
router.post("/register", registerLimiter, registerValidators, authController.register);
router.post("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;