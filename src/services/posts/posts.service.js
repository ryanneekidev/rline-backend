const postsRepository = require('../../repositories/posts/posts.repository');
const notificationsService = require('../notifications/notifications.service');

const getAllPosts = async () => {
    try {
        const posts = await postsRepository.getAllPosts();
        return {
            success: true,
            posts: posts
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        return {
            success: false,
            message: "Failed to retrieve posts"
        }
    }
};

const getPostById = async (postId) => {
    try {
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
    } catch (error) {
        console.error("Error fetching post:", error);
        return {
            success: false,
            message: "Failed to retrieve post"
        }
    }
};

const likePost = async (userId, postId) => {
    try {
        const existingLike = await postsRepository.getExistingLike(userId, postId);

        if (existingLike) {
            return {
                success: false,
                alreadyLiked: true,
                message: "You have already liked this post"
            };
        }

        const post = await postsRepository.getPostById(postId);
        const like = await postsRepository.likePost(userId, postId);

        await notificationsService.createNotification(post.authorId, userId, 'LIKE', postId);

        return {
            success: true,
            like: like,
            message: "Post liked successfully"
        }
    } catch (error) {
        console.error("Error liking post:", error);
        return {
            success: false,
            message: "Failed to like post"
        }
    }
};

const dislikePost = async (postId, userId) => {
    try {
        const like = await postsRepository.getExistingLike(userId, postId);

        if (!like) {
            return {
                success: false,
                notFound: true,
                message: "You have not liked this post"
            }
        }

        await postsRepository.dislikePost(postId, like.id);

        return {
            success: true,
            message: "Post disliked successfully"
        }
    } catch (error) {
        console.error("Error disliking post:", error);
        return {
            success: false,
            message: "Failed to dislike post"
        }
    }
};

const createComment = async (content, userId, postId) => {
    try {
        const post = await postsRepository.getPostById(postId);
        await postsRepository.createComment(content, userId, postId);

        await notificationsService.createNotification(post.authorId, userId, 'COMMENT', postId);

        return {
            success: true,
            message: "Comment created successfully"
        }
    } catch (error) {
        console.error("Error creating comment:", error);
        return {
            success: false,
            message: "Failed to create comment"
        }
    }
};

const createPost = async (title, content, authorId, postStatus) => {
    try {
        await postsRepository.createPost(title, content, authorId, postStatus);
        return {
            success: true,
            message: "Post created successfully"
        }
    } catch (error) {
        console.error("Error creating post:", error);
        return {
            success: false,
            message: "Failed to create post"
        }
    }
};

module.exports = { getAllPosts, getPostById, likePost, dislikePost, createComment, createPost };