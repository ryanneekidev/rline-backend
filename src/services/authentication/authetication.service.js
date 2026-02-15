const { successMessages, errorMessages } = require("../../utils/messages.js");
const db = require("../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (username, password) => {
	if (!username || !password) {
		return (
            {
                message: errorMessages.noUsernameOrPassword
            }
        )
	}

	if (username === "" || password === "") {
		return (
			{
				message: errorMessages.noUsernameOrPassword
			}
		)
	}

	const user = await db.getUserByUsername(username);
	const likes = await db.getUserLikedPosts(user.id);

  	if (!user) {
		return (
			{
				message: errorMessages.incorrectUsernameOrPassword
			}
		)
  	}

	if (!(await bcrypt.compare(password, user.password))) {
		return (
			{
				message: errorMessages.incorrectUsernameOrPassword
			}
		)
	}

  	const accessToken = jwt.sign(
		{
			id: user.id,
			username: user.username,
			email: user.email,
			joinedAt: user.joinedAt,
			role: user.role
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_VALIDITY,
		}
  	);

  	const refreshToken = jwt.sign(
		{
			id: user.id,
			username: user.username,
			email: user.email,
			joinedAt: user.joinedAt,
			role: user.role
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_VALIDITY
		}
  	);

    return {
        success: true,
        message: successMessages.loginSuccess + ` (${username})`,
        accessToken: accessToken,
        refreshToken: refreshToken,
        likes: likes
    }
};

module.exports  = { login };