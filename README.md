# RLine

> This project is the back end for the RLine project. Built using Node.js, Express, Prisma, bcryptjs, JSON Web Tokens, and more. Currently hosted at https://api.rline.ryanneeki.xyz/

RLine is a practice project to practice building full stack application end to end.
It currently serves as a small and barebones social media application that allows users to create accounts with their email address, post text messages which are visible to other users who can interact with them.
The name is inspired by "Line", a popular text messenger in Japan and South Korea. It's a combination of Line and the first letter of my name.

# API documentation

### Authentication

Some endpoints require a JWT access token in the `Authorization` header (as `Bearer <token>`) and/or a refresh token stored in an HTTP-only cookie.

---

### `GET /`
**Description:**  
Returns a welcome message.

**Response:**  
- `200 OK`
    ```json
    {
      "message": "<WELCOME_MESSAGE from environment>"
    }
    ```

---

### `GET /posts`
**Description:**  
Fetch all posts.

**Response:**  
- `200 OK`: Array of post objects.

---

### `POST /post`
**Description:**  
Fetch a single post by its ID.

**Request Body:**
```json
{
  "postId": "<post id>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "post": { /* post data */ },
      "message": "Post retrieved successfully"
    }
    ```

---

### `GET /private`
**Description:**  
Protected route; returns a message if authenticated.

**Headers:**
```
Authorization: Bearer <access token>
```

**Response:**
- `200 OK`
    ```json
    {
      "message": "Weclome to the private endpoint!"
    }
    ```
- `403 Forbidden` if not authenticated.

---

### `POST /login`
**Description:**  
Authenticate a user with username and password.

**Request Body:**
```json
{
  "username": "<username>",
  "password": "<password>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "message": "Successfully logged in! (<username>)",
      "token": "<JWT access token>"
    }
    ```
- Sets HTTP-only cookie with refresh token.
- `400/401` on error.

---

### `POST /register`
**Description:**  
Register a new user.

**Request Body:**
```json
{
  "username": "<username>",
  "email": "<email>",
  "password": "<password>",
  "confirmedPassword": "<password again>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "message": "User created successfully!",
      "pass": true
    }
    ```
- `400` on error (e.g., missing fields, username/email taken, passwords do not match).

---

### `POST /posts/like`
**Description:**  
Like a post.

**Request Body:**
```json
{
  "userId": "<user id>",
  "postId": "<post id>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "updatedLikes": [ /* liked post ids */ ],
      "message": "Post liked successfully"
    }
    ```

---

### `POST /posts/dislike`
**Description:**  
Remove a like from a post.

**Request Body:**
```json
{
  "userId": "<user id>",
  "postId": "<post id>",
  "likeId": "<like id>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "updatedLikes": [ /* liked post ids after removal */ ],
      "message": "Post disliked successfully"
    }
    ```

---

### `POST /comment`
**Description:**  
Create a new comment on a post.

**Request Body:**
```json
{
  "userId": "<user id>",
  "postId": "<post id>",
  "content": "<comment text>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "message": "Comment created successfully"
    }
    ```

---

### `POST /posts` (protected)
**Description:**  
Create a new post. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <access token>
```

**Request Body:**
```json
{
  "title": "<title>",
  "content": "<post body>",
  "postStatus": "<status>"
}
```

**Response:**
- `200 OK`
    ```json
    {
      "message": "Post created successfully"
    }
    ```
- `401` if token is missing/invalid.

---

### `POST /refresh`
**Description:**  
Refresh the access token using the HTTP-only refresh token cookie.

**Cookies:**
- `RLineRefreshToken=<refresh token>`

**Response:**
- `200 OK`
    ```json
    {
      "message": "Successfully refreshed access token for user <username>",
      "token": "<new JWT access token>"
    }
    ```
- `400/403` on error.

---

## Notes

- All responses are in JSON format.
- Errors generally return a JSON object with a `message` field describing the error.
- Protected endpoints require a valid JWT access token in the `Authorization` header.
- The refresh endpoint requires a valid refresh token cookie.
- For more details about data structure, see the code or database models.
