const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const bcrypt = require('bcryptjs')
const cors = require('cors');
const db = require("./db.js");
const {Prisma} = require('@prisma/client');

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
    noUsernameOrPasswordOrEmail: "Missing username, password or email!",
    incorrectUsername: "Incorrect username!",
    incorrectPassword: "Incorrect password!",
    incorrectUsernameOrPassword: "Incorrect username or password",
    noAcessToken: "You are unauthorized to access this endpoint!",
    invalidAccessToken: "Your access token is invalid or has expired!",
    noRefreshToken: "No refresh token provided!",
    invalidRefreshToken: "Your refresh token is invalid or has expired!",
    noAuthorizationHeader: "No authorization header provided!"
}

const successMessages = {
    loginSuccess: 'Successfully logged in!',
    refreshSucess: 'Successfully refreshed access token for user '
}

const auth = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    
    if(!authorizationHeader){
        return res.status(403).json(
            {
                message: errorMessages.noAcessToken
            }
        )
    }

    const accessToken = authorizationHeader.split(' ')[1]

    if(!accessToken){
        return res.status(403).json(
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

    if(username==="" || password===""){
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
                message: errorMessages.incorrectUsernameOrPassword
            }
        )
    }

    if(!(await bcrypt.compare(password, user.password))){
        return res.status(401).json(
            {
                message: errorMessages.incorrectUsernameOrPassword
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

app.post('/api/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email
    const hashedPassword = await bcrypt.hash(password, 10);

    if(!username || !password || !email){
        return res.status(400).json(
            {
                message: errorMessages.noUsernameOrPasswordOrEmail
            }
        )
    }
    
    try {
        let usernameExists = await db.getUserByUsername(username);
        let emailExists = await db.getUserByEmail(email);
        if(usernameExists&&emailExists){
            return res.status(400).json({
                message: `Username ${username} and email address ${email} are not available`,
            })
        }
        
        if(usernameExists){
            return res.status(400).json({
                message: `Username ${username} is not available`,
            })
        }
        
        if(emailExists){
            return res.status(400).json({
                message: `Email address ${email} is not available`,
            })
        }
        
        await db.createUser(username, email, hashedPassword);

        res.status(200).json({
            message: "User created successfully!",
            code: 200
        })

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({
                message: error.message,
                code: error.code
            })
        }
    }
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