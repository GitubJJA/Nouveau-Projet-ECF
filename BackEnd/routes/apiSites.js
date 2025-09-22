import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getAllSites, getSiteById, createSite, updateSite, patchSite, deleteSite } from '../controllers/sitesController.js';

const router = express.Router();

// GET /api/sites -> return all sites
router.get('/', getAllSites);

// GET /api/sites/:id
router.get('/:id', getSiteById);

// POST /api/sites
router.post('/', authenticate, createSite);

// PUT /api/sites/:id
router.put('/:id', authenticate, updateSite);

//PATCH /api/sites/:id
router.patch('/:id', authenticate, patchSite);

// DELETE /api/sites/:id
router.delete('/:id', authenticate, deleteSite);

export default router;

