const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const db = require("./db.js");
const { Prisma } = require("@prisma/client");
const { successMessages, errorMessages } = require("./utils/messages.js");
const auth = require("./middleware/auth.js");
const authenticationRouter = require("./routers/authentication/authentication.route.js");


dotenv.config();

const isDev = process.env.NODE_ENV === "development";
const allowedOrigin = isDev ? ["http://localhost:3000"] : ["https://rline.ryanneeki.xyz"];

const app = express();

app.use(
	cors(
		{
			origin: allowedOrigin,
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization']
		}
	)
);
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT;

/* BEGIN REFACTORING */

app.use("/auth", authenticationRouter);

/* END REFACTORING */

app.get("/", (req, res) => {
	res.status(200).json(
		{
			message: process.env.WELCOME_MESSAGE
		}
	)
});

app.get("/posts", async (req, res) => {
	const posts = await db.getPosts();
	res.status(200).json(posts)
});

app.get("/users/:userId/likes", async (req, res) => {
	try {
		const userId = req.params.userId;
		const likes = await db.getUserLikedPosts(userId);
		res.status(200).json(likes)
	} catch (error) {
		console.error("Error fetching user likes:", error);
		res.status(500).json(
			{ 
				message: "Failed to fetch user likes"
			}
		)
	}
});

app.post("/post", async (req, res) => {
	let postId = req.body.postId;
	const post = await db.getPost(postId);
	res.status(200).json(
		{
			post: post,
			message: "Post retrieved successfully"
		}
	)
});

app.post("/posts/like", async (req, res) => {
	try {
		let userId = req.body.userId;
		let postId = req.body.postId;

		const like = await db.likePost(userId, postId);

		res.status(200).json(
			{
				like: like,
				message: "Post liked successfully"
			}
		);
	} catch (error) {
		console.error("Error liking post:", error);
		res.status(500).json(
			{ 
				message: "Failed to like post"
			}
		);
	}
});

app.post("/posts/dislike", async (req, res) => {
	try {
		let userId = req.body.userId;
		let postId = req.body.postId;
		let likeId = req.body.likeId;

		await db.dislikePost(userId, postId, likeId);

		res.status(200).json(
			{
				message: "Post disliked successfully"
			}
		);
	} catch (error) {
		console.error("Error disliking post:", error);
		res.status(500).json(
			{ 
				message: "Failed to dislike post" 
			}
		);
	}
});

app.post("/comment", async (req, res) => {
	let userId = req.body.userId;
	let postId = req.body.postId;
	let content = req.body.content;
	await db.createComment(content, userId, postId);
	res.status(200).json(
		{
			message: "Comment created successfully"
		}
	);
});

app.post("/posts", auth, async (req, res) => {
	try {
		const { title, content, postStatus } = req.body;
		const authorId = req.user.id;

		await db.createPost(title, content, authorId, postStatus);
		res.status(201).json(
			{
				message: "Post created successfully"
			}
		);
	} catch (error) {
		console.error("Error creating post:", error);
		res.status(500).json(
			{
				message: "Failed to create post"
			}
		)
	}
});

app.post("/users/follow", auth, async (req, res) => {
	try {
		const followerId = req.user.id;
		const followingId = req.body.followingId;

		if (followerId === followingId) {
			return res.status(400).json(
				{ 
					message: "You cannot follow yourself" 
				}
			);
		}

		const follow = await db.followUser(followerId, followingId);

		res.status(200).json(
			{
				follow: follow,
				message: "User followed successfully"
			}
		);
	} catch (error) {
		console.error("Error following user:", error);
		res.status(500).json(
			{ 
				message: "Failed to follow user" 
			}
		);
	}
});

app.post("/users/unfollow", auth, async (req, res) => {
	try {
		const followerId = req.user.id;
		const followingId = req.body.followingId;

		await db.unfollowUser(followerId, followingId);
		res.status(200).json(
			{
				message: "User unfollowed successfully"
			}
		);
	} catch (error) {
		console.error("Error unfollowing user:", error);
		res.status(500).json(
			{ 
				message: "Failed to unfollow user" 
			}
		);
	}
});

// Get followers of a user
app.get("/users/:userId/followers", async (req, res) => {
	try {
		const userId = req.params.userId;
		const followers = await db.getFollowers(userId);
		res.status(200).json(followers);
	} catch (error) {
		console.error("Error getting followers:", error);
		res.status(500).json(
			{
				message: "Failed to get followers"
			}
		);
	}
});

app.get("/users/:userId/following", async (req, res) => {
	try {
		const userId = req.params.userId;
		const following = await db.getFollowing(userId);
		res.status(200).json(following);
	} catch (error) {
		console.error("Error getting following:", error);
		res.status(500).json(
			{
				message: "Failed to get following"
			}
		);
	}
});

app.get("/users/:userId/is-following", auth, async (req, res) => {
	try {
		const followerId = req.user.id;
		const followingId = req.params.userId;
		const isFollowing = await db.isFollowing(followerId, followingId);
		res.status(200).json(isFollowing);
	} catch (error) {
		console.error("Error checking follow status:", error);
		res.status(500).json(
			{
				message: "Failed to check follow status"
			}
		);
	}
});

app.get("/users/:userId/follow-counts", async (req, res) => {
	try {
		const userId = req.params.userId;
		const counts = await db.getFollowCounts(userId);
		res.status(200).json(counts);
	} catch (error) {
		console.error("Error getting follow counts:", error);
		res.status(500).json(
			{
				message: "Failed to get follow counts"
			}
		);
	}
});

app.get("/users/username/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const user = await db.getUserByUsername(username);

		if (!user) {
			return res.status(404).json(
				{
					message: "User not found"
				}
			);
		}

		// Don't send password
		const { password, ...userWithoutPassword } = user;
		res.status(200).json(
			{
				user: userWithoutPassword 
			}
		);
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json(
			{
				message: "Failed to fetch user"
			}
		);
	}
});

app.get("/users/:userId/posts/count", async (req, res) => {
	try {
		const userId = req.params.userId;
		const count = await db.countUserPosts(userId);
		res.status(200).json(count);
	} catch (error) {
		console.error("Error counting posts:", error);
		res.status(500).json(
			{
				message: "Failed to count posts"
			}
		);
	}
});

app.listen(process.env.PORT || 4000, (req, res) => {
  	console.log(`Server started and listening for requests at ${PORT}`);
});
