const errorMessages = {
	noUsername: "Missing username!",
	noPassword: "Missing password!",
	noUsernameAndPassword: "Missing username and password!",
	noUsernameOrPassword: "Missing username or password!",
	noUsernameOrPasswordOrEmail: "Missing username, password or email!",
	incorrectUsername: "Incorrect username!",
	incorrectPassword: "Incorrect password!",
	incorrectUsernameOrPassword: "Incorrect username or password",
	noAcessToken: "You are unauthorized to access this endpoint!",
	invalidAccessToken: "Your access token is invalid or has expired!",
	noRefreshToken: "No refresh token provided!",
	invalidRefreshToken: "Your refresh token is invalid or has expired!",
	noAuthorizationHeader: "No authorization header provided!"
};

const successMessages = {
	loginSuccess: "Successfully logged in!",
	refreshSucess: "Successfully refreshed access token for user "
};

module.exports = {errorMessages, successMessages}