import express from 'express';
import { getAllSites, getSiteById, createSite, updateSite, patchSite, deleteSite } from '../controllers/sitesController.js';

const router = express.Router();

// GET /api/sites -> return all sites
router.get('/', getAllSites);

// GET /api/sites/:id
router.get('/:id', getSiteById);

// POST /api/sites
router.post('/', createSite);

// PUT /api/sites/:id
router.put('/:id', updateSite);

//PATCH /api/sites/:id
router.patch('/:id', patchSite);

// DELETE /api/sites/:id
router.delete('/:id', deleteSite);

export default router;

