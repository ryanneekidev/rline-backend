const { successMessages, errorMessages } = require("../../utils/messages.js");
const userRepository = require("../../repositories/users/user.repository.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (username, password) => {
	const user = await userRepository.getUserByUsername(username);

	if (!user) {
		return {
			success: false,
			message: errorMessages.incorrectUsernameOrPassword
		};
  	}

	if (!(await bcrypt.compare(password, user.password))) {
		return {
			success: false,
			message: errorMessages.incorrectUsernameOrPassword
		};
	}

	const likes = await userRepository.getUserLikedPosts(user.id);

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

const register = async (username, password, confirmedPassword, email) => {
	if (password !== confirmedPassword) {
		return {
			message: `Passwords do not match!`,
			success: false
		};
	}

  	try {
		let usernameExists = await userRepository.getUserByUsername(username);
		let emailExists = await userRepository.getUserByEmail(email);
		if (usernameExists && emailExists) {
			return (
				{
					message: `Username ${username} and email address ${email} are not available`,
					success: false
				}
			);
		}

		if (usernameExists) {
			return (
				{
					message: `Username ${username} is not available`,
					success: false
				}
			);
		}

		if (emailExists) {
			return {
				message: `Email address ${email} is not available`,
				success: false
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await userRepository.createUser(username, email, hashedPassword);

		return {
			message: "User created successfully!",
			success: true
		}
  	} catch (error) {
		return {
			message: error.message,
			success: false
		};
  	}
};

const refresh = async (refreshToken) => {
	if (!refreshToken) {
		return (
			{
				success: false,
				message: errorMessages.noRefreshToken,
			}
		);
	}

	try {
		const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

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
				expiresIn: process.env.ACCESS_TOKEN_VALIDITY
			}
		);

		return (
			{
				success: true,
				message: successMessages.refreshSuccess + user.username,
				token: accessToken
			}
		);
	} catch (err) {
        return {
            success: false,
            message: errorMessages.invalidRefreshToken,
        };
    }
};

module.exports  = { login, register, refresh };