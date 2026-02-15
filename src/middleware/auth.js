export const auth = async (req, res, next) => {
	const authorizationHeader = req.headers.authorization;

	if (!authorizationHeader) {
		return res.status(403).json({
		message: errorMessages.noAcessToken,
		});
	}

	const accessToken = authorizationHeader.split(" ")[1];

	if (!accessToken) {
		return res.status(403).json({
		message: errorMessages.noAcessToken,
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