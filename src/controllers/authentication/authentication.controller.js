/*
res.cookie(
        `${process.env.BRAND}RefreshToken`, 
        refreshToken, 
        {
            httpOnly: true,
            sameSite: "None",
            secure: isDev ? true : false,
            domain: ".rline.ryanneeki.xyz",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000
        }
    );

    res.status(200).json({
        message: successMessages.loginSuccess + ` (${username})`,
        token: accessToken,
        likes: likes
    });
*/
const { successMessages, errorMessages } = require("../../utils/messages.js");

const isDev = process.env.NODE_ENV === "development";

const loginService = require("../../services/authentication/authetication.service");

const login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const result = await loginService.login(username, password);

    if (result.success) {
        res.cookie(
            `${process.env.BRAND}RefreshToken`, 
            result.refreshToken, 
            {
                httpOnly: true,
                sameSite: "None",
                secure: isDev ? true : false,
                domain: ".rline.ryanneeki.xyz",
                path: "/",
                maxAge: 24 * 60 * 60 * 1000
            }
        );
        res.status(200).json(
            {
                message: successMessages.loginSuccess + ` (${username})`,
                token: result.accessToken,
                likes: result.likes
            }
        );
    } else {
        res.status(400).json(
            {
                message: result.message
            }
        );
    }
}

module.exports = { login };
