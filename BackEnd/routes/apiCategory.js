// BackEnd/routes/apiCategory.js
import { Router } from 'express';
import { getAllCategories } from '../controllers/CategoryController.js';


const router = Router();

// GET -> lire toutes les catégories
router.get('/', getAllCategories);

export default router;
