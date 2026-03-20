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

const updatePost = async (postId, userId, title, content) => {
    try {
        const post = await postsRepository.getPostById(postId);
        if (!post) return { success: false, notFound: true, message: "Post not found" };
        if (post.authorId !== userId) return { success: false, unauthorized: true, message: "You do not own this post" };

        const updated = await postsRepository.updatePost(postId, title, content);
        return { success: true, post: updated };
    } catch (error) {
        console.error("Error updating post:", error);
        return { success: false, message: "Failed to update post" };
    }
};

const deletePost = async (postId, userId) => {
    try {
        const post = await postsRepository.getPostById(postId);
        if (!post) return { success: false, notFound: true, message: "Post not found" };
        if (post.authorId !== userId) return { success: false, unauthorized: true, message: "You do not own this post" };

        await postsRepository.deletePost(postId);
        return { success: true, message: "Post deleted successfully" };
    } catch (error) {
        console.error("Error deleting post:", error);
        return { success: false, message: "Failed to delete post" };
    }
};

const updateComment = async (postId, commentId, userId, content) => {
    try {
        const comment = await postsRepository.getCommentById(commentId);
        if (!comment || comment.parentPostId !== postId) return { success: false, notFound: true, message: "Comment not found" };
        if (comment.authorId !== userId) return { success: false, unauthorized: true, message: "You do not own this comment" };

        const updated = await postsRepository.updateComment(commentId, content);
        return { success: true, comment: updated };
    } catch (error) {
        console.error("Error updating comment:", error);
        return { success: false, message: "Failed to update comment" };
    }
};

const deleteComment = async (postId, commentId, userId) => {
    try {
        const comment = await postsRepository.getCommentById(commentId);
        if (!comment || comment.parentPostId !== postId) return { success: false, notFound: true, message: "Comment not found" };
        if (comment.authorId !== userId) return { success: false, unauthorized: true, message: "You do not own this comment" };

        await postsRepository.deleteComment(commentId);
        return { success: true, message: "Comment deleted successfully" };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { success: false, message: "Failed to delete comment" };
    }
};

module.exports = { getAllPosts, getPostById, likePost, dislikePost, createComment, createPost, updatePost, deletePost, updateComment, deleteComment };