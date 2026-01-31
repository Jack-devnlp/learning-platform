const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { Document } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadFile, getFileUrl, minioClient, bucketName } = require('../utils/minio');

const router = express.Router();

// Configure multer with file size limit and file type filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, and Video files are allowed.'), false);
    }
  }
});

// GET /api/documents
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? { title: { [require('sequelize').Op.iLike]: '%' + search + '%' } } : {};

    const { count, rows } = await Document.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// POST /api/documents
router.post('/',
  auth,
  requireAdmin,
  upload.single('file'),
  validate([
    body('title').notEmpty().withMessage('Title is required')
  ]),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
      }

      const { title, description } = req.body;
      const file = req.file;

      // Determine file type
      let fileType;
      if (file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
        fileType = 'word';
      } else if (file.mimetype.includes('video')) {
        fileType = 'video';
      } else {
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      // Upload to MinIO
      const objectName = Date.now() + '-' + file.originalname;
      await uploadFile(file, objectName);

      // Save to database
      const document = await Document.create({
        title,
        description,
        fileUrl: objectName,
        fileType,
        fileSize: file.size,
        uploaderId: req.user.id
      });

      res.status(201).json({
        document: {
          ...document.toJSON(),
          fileUrl: getFileUrl(objectName)
        }
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

// GET /api/documents/:id/view - 流式传输文件（PDF/视频）
router.get('/:id/view', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const stream = await minioClient.getObject(bucketName, document.fileUrl);
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    stream.pipe(res);
  } catch (error) {
    console.error('View document error:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// GET /api/documents/:id/content - 提取 Word 文档内容
router.get('/:id/content', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.fileType !== 'word') {
      return res.status(400).json({ error: 'Only Word documents are supported' });
    }

    const stream = await minioClient.getObject(bucketName, document.fileUrl);

    // 使用 mammoth 提取 HTML 内容
    const mammoth = require('mammoth');
    const buffer = [];

    stream.on('data', chunk => buffer.push(chunk));
    stream.on('end', async () => {
      try {
        const result = await mammoth.convertToHtml({ buffer: Buffer.concat(buffer) });
        res.json({ content: result.value });
      } catch (err) {
        console.error('Word conversion error:', err);
        res.status(500).json({ error: 'Failed to convert document' });
      }
    });
    stream.on('error', err => {
      console.error('Stream error:', err);
      res.status(500).json({ error: 'Failed to read document' });
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get document content' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = 'inactive';
    await document.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
