const postsRepository = require('../../repositories/posts/posts.repository');

const getAllPosts = async () => {
    const posts = await postsRepository.getAllPosts();

    return {
        success: true,
        posts: posts
    }
};

const getPostById = async (postId) => {
    const post = await postsRepository.getPostById(postId);

    if (post) {
        return {
            success: true,
            post: post
        }
    } else {
        return {
            success: false,
            message: "Post not found"
        }
    }
};

module.exports = { getAllPosts, getPostById };