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

module.exports = { getAllPosts, getPostById };