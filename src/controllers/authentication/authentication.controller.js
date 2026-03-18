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
                expires: new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_MAX_AGE))
            }
        );
        res.status(200).json(
            {
                success: result.success,
                message: result.message,
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

    if (result.success) {
        res.status(201).json(
            {
                success: result.success,
                message: result.message
            }
        );
    } else {
        res.status(400).json(
            {
                success: result.success,
                message: result.message
            }
        )
    }
}

const refresh = async (req, res) => {
    const refreshToken = req.cookies[`${process.env.BRAND}RefreshToken`];

    const result = await authenticationService.refresh(refreshToken);

    if (result.success) {
        res.status(200).json(
            {
                success: result.success,
                message: result.message,
                token: result.token
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
