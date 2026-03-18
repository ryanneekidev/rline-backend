const express = require("express");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const authenticationRouter = require("./routers/authentication/authentication.route.js");
const postsRouter = require("./routers/posts/posts.route.js");
const usersRouter = require("./routers/users/users.route.js");
const notificationsRouter = require("./routers/notifications/notifications.route.js");

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

app.use("/auth", authenticationRouter);
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/notifications", notificationsRouter);

app.get("/", (req, res) => {
	res.status(200).json(
		{
			message: process.env.WELCOME_MESSAGE
		}
	)
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ success: false, message: "An unexpected error occurred" });
});

app.listen(process.env.PORT || 4000, () => {
	console.log(`Server started and listening for requests at ${PORT}`);
});
