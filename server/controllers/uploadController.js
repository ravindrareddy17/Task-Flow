const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { File } = require('../models');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'taskflow',
      resource_type: 'auto',
    });

    // Create file record in DB
    const fileRecord = await File.create({
      url: result.secure_url,
      publicId: result.public_id,
      name: req.file.originalname || 'file',
      format: result.format,
      size: result.bytes,
      taskId: req.body.taskId || null,
      messageId: req.body.messageId || null,
      projectId: req.body.projectId || null,
      uploadedBy: req.user.id,
    });

    res.json({
      id: fileRecord.id,
      url: result.secure_url,
      publicId: result.public_id,
      name: fileRecord.name,
      format: result.format,
      size: result.bytes,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
