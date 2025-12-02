const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const bcrypt = require('bcryptjs')
const cors = require('cors');
const db = require("./db.js");
const { Prisma } = require('@prisma/client');

const isDev = process.env.NODE_ENV === 'development';

require('dotenv').config()

const app = express();

/*
app.use(cors({
    origin: "https://rline.ryanneeki.xyz",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
*/

app.use((req, res, next) => {

    const allowedOrigins = isDev
        ? ['http://localhost:3000', 'https://rline.ryanneeki.xyz']
        : ['https://rline.ryanneeki.xyz'];

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    next()
})

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

    if (!authorizationHeader) {
        return res.status(403).json(
            {
                message: errorMessages.noAcessToken
            }
        )
    }

    const accessToken = authorizationHeader.split(' ')[1]

    if (!accessToken) {
        return res.status(403).json(
            {
                message: errorMessages.noAcessToken
            }
        )
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json(
                {
                    message: errorMessages.invalidAccessToken
                }
            )
        }
        req.user = decoded;
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

app.get('/posts', async (req, res) => {
    const posts = await db.getPosts();
    res.status(200).json(posts)
})

app.post('/post', async (req, res) => {
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

    if (!username || !password) {
        return res.status(400).json(
            {
                message: errorMessages.noUsernameOrPassword
            }
        )
    }

    if (username === "" || password === "") {
        return res.status(400).json(
            {
                message: errorMessages.noUsernameOrPassword
            }
        )
    }

    const user = await db.getUserByUsername(username);
    const likes = await db.getUserLikedPosts(user.id)

    if (!user) {
        return res.status(401).json(
            {
                message: errorMessages.incorrectUsernameOrPassword
            }
        )
    }

    if (!(await bcrypt.compare(password, user.password))) {
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
            /*
            posts: user.posts,
            comments: user.comments,
            like: user.like
            */
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
            /*
            posts: user.posts,
            comments: user.comments,
            like: user.like
            */
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
        domain: '.rline.ryanneeki.xyz',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000
    })

    res.status(200).json(
        {
            message: successMessages.loginSuccess + ` (${username})`,
            token: accessToken,
            likes: likes
        }
    )
})


app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;
    const email = req.body.email
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!username || !password || !email) {
        return res.status(400).json(
            {
                message: errorMessages.noUsernameOrPasswordOrEmail
            }
        )
    }

    if (password !== confirmedPassword) {
        return res.status(400).json({
            message: `Passwords do not match!`,
            pass: false
        })
    }


    try {
        let usernameExists = await db.getUserByUsername(username);
        let emailExists = await db.getUserByEmail(email);
        if (usernameExists && emailExists) {
            return res.status(400).json({
                message: `Username ${username} and email address ${email} are not available`,
                pass: false
            })
        }

        if (usernameExists) {
            return res.status(400).json({
                message: `Username ${username} is not available`,
                pass: false
            })
        }

        if (emailExists) {
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
    try {
        let userId = req.body.userId;
        let postId = req.body.postId;

        const like = await db.likePost(userId, postId);

        // Only return the new like record, not all user likes
        res.status(200).json({
            like: like,
            message: 'Post liked successfully'
        })
    } catch (error) {
        console.error('Error liking post:', error)
        res.status(500).json({ message: 'Failed to like post' })
    }
})

app.post('/posts/dislike', async (req, res) => {
    try {
        let userId = req.body.userId;
        let postId = req.body.postId;
        let likeId = req.body.likeId;

        await db.dislikePost(userId, postId, likeId);

        res.status(200).json({
            message: 'Post disliked successfully'
        })
    } catch (error) {
        console.error('Error disliking post:', error)
        res.status(500).json({ message: 'Failed to dislike post' })
    }
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

app.post('/posts', auth, async (req, res) => {
    /*
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
    */
    try {
        const { title, content, postStatus } = req.body;
        const authorId = req.user.id;

        await db.createPost(title, content, authorId, postStatus);
        res.status(201).json({
            message: 'Post created successfully'
        })
    } catch (error) {
        console.error('Error creating post:', error)
        res.status(500).json({
            message: 'Failed to create post'
        })
    }
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
                id: user.id,
                username: user.username,
                email: user.email,
                joinedAt: user.joinedAt,
                role: user.role,
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

// Follow a user
app.post('/users/follow', auth, async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.body.followingId;

        if (followerId === followingId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const follow = await db.followUser(followerId, followingId);
        res.status(200).json({
            follow: follow,
            message: 'User followed successfully'
        });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Failed to follow user' });
    }
});

// Unfollow a user
app.post('/users/unfollow', auth, async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.body.followingId;

        await db.unfollowUser(followerId, followingId);
        res.status(200).json({
            message: 'User unfollowed successfully'
        });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Failed to unfollow user' });
    }
});

// Get followers of a user
app.get('/users/:userId/followers', async (req, res) => {
    try {
        const userId = req.params.userId;
        const followers = await db.getFollowers(userId);
        res.status(200).json({ followers });
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: 'Failed to get followers' });
    }
});

// Get following of a user
app.get('/users/:userId/following', async (req, res) => {
    try {
        const userId = req.params.userId;
        const following = await db.getFollowing(userId);
        res.status(200).json({ following });
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: 'Failed to get following' });
    }
});

// Check if current user follows another user
app.get('/users/:userId/is-following', auth, async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.userId;
        const isFollowing = await db.isFollowing(followerId, followingId);
        res.status(200).json({ isFollowing });
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ message: 'Failed to check follow status' });
    }
});

// Get follower/following counts
app.get('/users/:userId/follow-counts', async (req, res) => {
    try {
        const userId = req.params.userId;
        const counts = await db.getFollowCounts(userId);
        res.status(200).json(counts);
    } catch (error) {
        console.error('Error getting follow counts:', error);
        res.status(500).json({ message: 'Failed to get follow counts' });
    }
});

app.listen(process.env.PORT || 4000, (req, res) => {
    console.log(`Server started and listening for requests at ${PORT}`)
})