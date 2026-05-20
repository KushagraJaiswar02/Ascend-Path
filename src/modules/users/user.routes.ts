import { Router } from 'express';
import { userController } from './user.controller';

const router = Router();

// Define user routes
router.post('/register', userController.registerUser);
router.get('/guides', userController.getGuides);
router.get('/:id', userController.getUserById);

export const userRoutes = router;
