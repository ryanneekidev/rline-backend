const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const bcrypt = require('bcryptjs')
const cors = require('cors');
const db = require("./db.js");
const {Prisma} = require('@prisma/client');

require('dotenv').config()

const app = express();

app.use(cors({
    origin: "https://rline.ryanneeki.xyz",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

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

app.get("/", (req, res) => {
    res.status(200).json(
        {
            message: process.env.WELCOME_MESSAGE
        }
    )
});

app.get('/posts', async (req, res)=>{
    const posts = await db.getPosts();
    res.status(200).json(posts)
})

app.post('/post', async (req, res)=> {
    let postId = req.body.postId
    const post = await db.getPost(postId)
    res.status(200).json({
        post: post,
        message: 'Post retrieved successfully'
    })
})

app.get("/private", auth, (req, res) => {
    res.status(200).json(
        {
            message: "Weclome to the private endpoint!"
        }
    )
});

app.post('/login', async (req, res) => {
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
            id: user.id,
            username: user.username,
            email: user.email,
            joinedAt: user.joinedAt,
            role: user.role,
            posts: user.posts,
            comments: user.comments,
            like: user.like
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_VALIDITY
        }
    )

    const refreshToken = jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            joinedAt: user.joinedAt,
            role: user.role,
            posts: user.posts,
            comments: user.comments,
            like: user.like
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


app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    const email = req.body.email
    const hashedPassword = await bcrypt.hash(password, 10);

    if(!username || !password || !email){
        return res.status(400).json(
            {
                message: errorMessages.noUsernameOrPasswordOrEmail
            }
        )
    }

    if(password!==confirmedPassword){
        return res.status(400).json({
            message: `Passwords do not match!`,
            pass: false
        })
    }
    
    
    try {
        let usernameExists = await db.getUserByUsername(username);
        let emailExists = await db.getUserByEmail(email);
        if(usernameExists&&emailExists){
            return res.status(400).json({
                message: `Username ${username} and email address ${email} are not available`,
                pass: false
            })
        }
        
        if(usernameExists){
            return res.status(400).json({
                message: `Username ${username} is not available`,
                pass: false
            })
        }
        
        if(emailExists){
            return res.status(400).json({
                message: `Email address ${email} is not available`,
                pass: false
            })
        }
        
        await db.createUser(username, email, hashedPassword);

        res.status(200).json({
            message: "User created successfully!",
            pass: true
        })

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({
                message: error.message,
                code: error.code,
                pass: false
            })
        }
    }
})

app.post('/posts/like', async (req, res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;
    await db.likePost(userId, postId);
    res.status(200).json({
        updatedLikes: await db.getUserLikedPosts(userId),
        message:'Post liked successfully'
    })
})

app.post('/posts/dislike', async (req, res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;
    let likeId = req.body.likeId;
    await db.dislikePost(userId, postId, likeId);
    res.status(200).json({
        updatedLikes: await db.getUserLikedPosts(userId),
        message:'Post disliked successfully'
    })
})

app.post('/comment', async (req, res) => {
    let userId = req.body.userId;
    let postId = req.body.postId;
    let content = req.body.content;
    await db.createComment(content, userId, postId)
    res.status(200).json({
        message: 'Comment created successfully'
    })
})

app.post('/posts', auth, async (req, res)=>{
    const title = req.body.title;
    const content = req.body.content;
    const postStatus = req.body.postStatus;
    const authHeaders = req.headers.authorization;
    const token = authHeaders.split(' ')[1];
    let user;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if(err){
            return res.status(401).json({ message: "Token is expired or invalid" });
        }
        user = decoded;
    })
    const authorId = user.id;
    await db.createPost(title, content, authorId, postStatus);
    res.status(200).json({
        message:'Post created successfully'
    })
})

app.post('/refresh', (req, res) => {
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

app.listen(4000, (req, res) => {
    console.log(`Server started and listening for requests at ${PORT}`)
})