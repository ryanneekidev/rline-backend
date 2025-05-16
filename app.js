const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const cors = require('cors');

const app = express();

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: "*",
    methods: 'GET,POST'
}))

require('dotenv').config()

const PORT = process.env.PORT;

const errorMessages = {
    noUsername: "Missing username!",
    noPassword: "Missing password!",
    noUsernameAndPassword: "Missing username and password!",
    noUsernameOrPassword: "Missing username or password!",
    incorrentUsername: "Incorrect username!",
    incorrentPassword: "Incorrect password!",
    noAcessToken: "You are unauthorized to access this endpoint!",
    invalidAccessToken: "Your access token is invalid or has expired!",
    noRefreshToken: "No refresh token provided!",
    invalidRefreshToken: "Your refresh token is invalid or has expired!"
}

const successMessages = {
    loginSuccess: 'Successfully logged in!',
    refreshSucess: 'Successfully refreshed access token for user '
}

const auth = async (req, res, next) => {
    const accessToken = req.body.token;

    if(!accessToken){
        res.status(403).json(
            {
                message: errorMessages.noAcessToken
            }
        )
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err){
            return res.status(403).json(
                {
                    message: errorMessages.invalidAccessToken
                }
            )
        }
        next();
    })
}

app.get("/api", (req, res) => {
    res.status(200).json(
        {
            message: process.env.WELCOME_MESSAGE
        }
    )
});

app.get("/api/private", auth, (req, res) => {
    res.status(200).json(
        {
            message: "Weclome to the private endpoint!"
        }
    )
});

app.post('/api/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).json(
            {
                message: errorMessages.noUsernameOrPassword
            }
        )
    }

    const user = await db.getUserByUsername(username);

    if(!user){
        return res.status(401).json(
            {
                message: errorMessages.incorrentUsername
            }
        )
    }

    if(password !== user.password){
        return res.status(401).json(
            {
                message: errorMessages.incorrentPassword
            }
        )
    }
    
    const accessToken = jwt.sign(
        {
            username: username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_VALIDITY
        }
    )

    const refreshToken = jwt.sign(
        {
            username: username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_VALIDITY
        }
    )

    res.cookie(`${process.env.BRAND}RefreshToken`, refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 24*60*60*1000
    })

    res.status(200).json(
        {
            message: successMessages.loginSuccess + ` (${username})`,
            token: accessToken
        }
    )
})

app.post('/api/refresh', (req, res) => {
    const refreshToken = req.cookies.RLineRefreshToken;

    if (!refreshToken) {
        return res.status(400).json(
            {
                message: errorMessages.noRefreshToken
            }
        )
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json(
                {
                    message: errorMessages.invalidRefreshToken
                }
            )
        }

        const accessToken = jwt.sign(
            {
                username: user.username
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_VALIDITY
            }
        )

        res.status(200).json({
            message: successMessages.refreshSucess + user.username,
            token: accessToken
        })
    })
})

app.listen(PORT, (req, res) => {
    console.log(`Server started and listening for requests at ${PORT}`)
})