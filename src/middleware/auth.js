const jwt = require("jsonwebtoken");
const { errorMessages } = require("../utils/messages.js");

const auth = async (req, res, next) => {
	const authorizationHeader = req.headers.authorization;

	if (!authorizationHeader) {
		return res.status(401).json({
		message: errorMessages.noAccessToken,
		});
	}

	const accessToken = authorizationHeader.split(" ")[1];

	if (!accessToken) {
		return res.status(401).json({
		message: errorMessages.noAccessToken,
		});
	}

	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
		return res.status(403).json({
			message: errorMessages.invalidAccessToken,
		});
		}
		req.user = decoded;
		next();
	});
};

module.exports = auth;