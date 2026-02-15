const { successMessages, errorMessages } = require("../../utils/messages.js");
const userRespository = require("../../repositories/user/user.repository.js");
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

	const user = await userRespository.getUserByUsername(username);
	const likes = await userRespository.getUserLikedPosts(user.id);

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

const register = async (username, password, confirmedPassword, email) => {
	const hashedPassword = await bcrypt.hash(password, 10);

	if (!username || !password || !email) {
		return (
			{
				message: errorMessages.noUsernameOrPasswordOrEmail,
				pass: false
			}
		)
	}

	if (password !== confirmedPassword) {
		return (
			{
				message: `Passwords do not match!`,
				pass: false
			}
		);
	}

  	try {
		let usernameExists = await userRespository.getUserByUsername(username);
		let emailExists = await userRespository.getUserByEmail(email);
		if (usernameExists && emailExists) {
			return (
				{
					message: `Username ${username} and email address ${email} are not available`,
					pass: false
				}
			);
		}

		if (usernameExists) {
			return (
				{
					message: `Username ${username} is not available`,
					pass: false
				}
			);
		}

		if (emailExists) {
			return (
				{
					message: `Email address ${email} is not available`,
					pass: false
				}
			);
		}

		await userRespository.createUser(username, email, hashedPassword);

		return {
			message: "User created successfully!",
			pass: true
		}
  	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return (
				{
					message: error.message,
					code: error.code,
					pass: false
				}
			);
		}
  	}
};

module.exports  = { login, register };