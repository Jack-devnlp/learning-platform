const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { Document } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadFile, getFileUrl } = require('../utils/minio');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
