import express from 'express';
import { authenticate, ensureAdmin } from '../middleware/authMiddleware.js';
import { getAllSites, getAllSitesAdmin, getSiteById, createSite, updateSite, patchSite, deleteSite, validateSite } from '../controllers/sitesController.js';

const router = express.Router();

// GET /api/sites -> return all sites
router.get('/', getAllSites);

// GET /api/admin/sites -> all sites (admin only)
router.get('/admin', authenticate, ensureAdmin, getAllSitesAdmin);

// GET /api/sites/:id
router.get('/:id', getSiteById);

// POST /api/sites
router.post('/', authenticate, createSite);

// PUT /api/sites/:id
router.put('/:id', authenticate, updateSite);

// PUT /api/sites/:id/validate -> validation (admin only)
router.put('/:id/validate', authenticate, ensureAdmin, validateSite);

//PATCH /api/sites/:id
router.patch('/:id', authenticate, patchSite);

// DELETE /api/sites/:id
router.delete('/:id', authenticate, deleteSite);

export default router;

