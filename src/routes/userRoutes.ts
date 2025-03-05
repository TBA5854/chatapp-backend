import express from 'express';
import { getUsers, getUserByUsername, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:username', getUserByUsername);
router.delete('/:username', deleteUser);

export default router;