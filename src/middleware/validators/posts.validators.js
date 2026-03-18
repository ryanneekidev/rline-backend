const { body } = require('express-validator');
const validate = require('./validate');

const createPostValidators = [
    body('title')
        .trim()
        .escape()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
    body('content')
        .trim()
        .escape()
        .notEmpty().withMessage('Content is required')
        .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters'),
    validate
];

const createCommentValidators = [
    body('content')
        .trim()
        .escape()
        .notEmpty().withMessage('Comment content is required')
        .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
    validate
];

module.exports = { createPostValidators, createCommentValidators };
