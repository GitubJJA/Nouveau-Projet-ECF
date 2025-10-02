import express from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser, loginUser, signupUser } from '../controllers/usersController.js';

const router = express.Router();

// list
router.get('/', listUsers);

// create
router.post('/', createUser);

// single
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Auth routes
router.post('/login', loginUser);
router.post('/signup', signupUser);

export default router;
