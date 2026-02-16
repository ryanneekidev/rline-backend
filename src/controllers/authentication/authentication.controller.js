const { successMessages, errorMessages } = require("../../utils/messages.js");

const isDev = process.env.NODE_ENV === "development";

const authenticationService = require("../../services/authentication/authentication.service.js");

const login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const result = await authenticationService.login(username, password);

    if (result.success) {
        res.cookie(
            `${process.env.BRAND}RefreshToken`, 
            result.refreshToken, 
            {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                domain: isDev ? ".localhost" : ".rline.ryanneeki.xyz",
                path: "/",
                maxAge: 24 * 60 * 60 * 1000
            }
        );
        res.status(200).json(
            {
                success: result.success,
                message: successMessages.loginSuccess + ` (${username})`,
                token: result.accessToken,
                likes: result.likes
            }
        );
    } else {
        res.status(400).json(
            {
                success: result.success,
                message: result.message
            }
        );
    }
}

const register = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    const email = req.body.email;

    const result = await authenticationService.register(username, password, confirmedPassword, email);

    if (result.pass) {
        res.status(201).json(
            {
                pass: result.pass,
                message: result.message
            }
        );
    } else {
        res.status(400).json(
            {
                pass: result.pass,
                message: result.message
            }
        )
    }
}

const refresh = async (req, res) => {
    const refreshToken = req.cookies.RLineRefreshToken;

    const result = await authenticationService.refresh(refreshToken);
    
    console.log(result);

    if (result.success) {
        res.status(200).json(
            {
                success: result.success,
                message: result.message,
                token: result.accessToken
            }
        );
    } else {
        res.status(403).json(
            {
                success: result.success,
                message: result.message
            }
        );
    }
}    

module.exports = { login, register, refresh };
