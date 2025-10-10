import express from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser, loginUser, signupUser } from '../controllers/usersController.js';
import { authenticate, ensureAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// list (allow listing to authenticated users or public depending on your policy)
router.get('/', authenticate, listUsers);

// create - only admin can create users via API
router.post('/', authenticate, ensureAdmin, createUser);

// single
router.get('/:id', authenticate, getUser);
// update - only admin or the user themselves
router.put('/:id', authenticate, updateUser);
// delete - only admin or the user themselves
router.delete('/:id', authenticate, deleteUser);

// Auth routes (public)
router.post('/login', loginUser);
router.post('/signup', signupUser);

export default router;
