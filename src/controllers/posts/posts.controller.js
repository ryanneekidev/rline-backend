const postsService = require('../../services/posts/posts.service');

const getAllPosts = async (req, res) => {
    const result = await postsService.getAllPosts();

    if (result.success) {
        res.status(200).json({
            success: true,
            posts: result.posts
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve posts"
        });
    }
};

const getPostById = async (req, res) => {
    let postId = req.params.postId;
    const result = await postsService.getPostById(postId);
    if (result.success) {
        res.status(200).json({
            success: true,
            post: result.post
        });
    } else {
        res.status(404).json({
            success: false,
            message: result.message
        });
    }
};

const likePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const result = await postsService.likePost(userId, postId);

    if (result.success) {
        res.status(200).json({
            success: true,
            like: result.like
        });
    } else if (result.alreadyLiked) {
        res.status(409).json({
            success: false,
            message: result.message
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.message
        });
    }
};

const dislikePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const result = await postsService.dislikePost(postId, userId);

    if (result.success) {
        res.status(200).json({
            success: true,
            message: result.message
        });
    } else if (result.notFound) {
        res.status(404).json({
            success: false,
            message: result.message
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.message
        });
    }
};

const createComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    const result = await postsService.createComment(content, userId, postId);
    if (result.success) {
        res.status(201).json({
            success: true,
            message: result.message
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.message
        });
    }
}

const createPost = async (req, res) => {
    const { title, content, postStatus = "NORMAL" } = req.body;
    const userId = req.user.id;
    const result = await postsService.createPost(title, content, userId, postStatus);
    if (result.success) {
        res.status(201).json({
            success: true,
            message: result.message
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.message
        });
    }
};

const updatePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { title, content } = req.body;

    const result = await postsService.updatePost(postId, userId, title, content);
    if (result.success) {
        res.status(200).json({ success: true, post: result.post });
    } else if (result.notFound) {
        res.status(404).json({ success: false, message: result.message });
    } else if (result.unauthorized) {
        res.status(403).json({ success: false, message: result.message });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const result = await postsService.deletePost(postId, userId);
    if (result.success) {
        res.status(200).json({ success: true, message: result.message });
    } else if (result.notFound) {
        res.status(404).json({ success: false, message: result.message });
    } else if (result.unauthorized) {
        res.status(403).json({ success: false, message: result.message });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

const updateComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const result = await postsService.updateComment(postId, commentId, userId, content);
    if (result.success) {
        res.status(200).json({ success: true, comment: result.comment });
    } else if (result.notFound) {
        res.status(404).json({ success: false, message: result.message });
    } else if (result.unauthorized) {
        res.status(403).json({ success: false, message: result.message });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const result = await postsService.deleteComment(postId, commentId, userId);
    if (result.success) {
        res.status(200).json({ success: true, message: result.message });
    } else if (result.notFound) {
        res.status(404).json({ success: false, message: result.message });
    } else if (result.unauthorized) {
        res.status(403).json({ success: false, message: result.message });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

module.exports = { getAllPosts, getPostById, likePost, dislikePost, createComment, createPost, updatePost, deletePost, updateComment, deleteComment };