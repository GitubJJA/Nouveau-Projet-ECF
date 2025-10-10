// BackEnd/routes/apiCategory.js
import { Router } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/CategoryController.js';
import { authenticate, ensureAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// GET -> lire toutes les catégories
router.get('/', getAllCategories);

// Protected routes for admins
router.post('/', authenticate, ensureAdmin, createCategory);
router.put('/:id', authenticate, ensureAdmin, updateCategory);
router.delete('/:id', authenticate, ensureAdmin, deleteCategory);

export default router;
