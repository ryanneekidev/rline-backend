const { Router } = require("express")

const uploadController = require('../../controllers/upload/upload.controller')
const auth = require('../../middleware/auth.js');

const uploadRouter = new Router()

uploadRouter.post('/presign', auth, uploadController.generateKey)

module.exports = uploadRouter
