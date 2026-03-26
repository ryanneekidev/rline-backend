const uploadService = require("../../services/upload/upload.service");

const generateKey = async (req, res) => {
    try {
        const result = await uploadService.generateKey();
        res.status(200).json({ success: true, key: result.uniqueKey, presignedUrl: result.presignedUrl });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Key could not be created!" });
    }
    module.exports = { generateKey }
}

module.exports = { generateKey }
