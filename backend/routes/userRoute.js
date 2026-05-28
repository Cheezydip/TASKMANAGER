import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateProfile, changePassword } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js'; 
const userRouter = express.Router();


//public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

//private routes
userRouter.get('/me',authMiddleware,getCurrentUser);
userRouter.put('/update',authMiddleware,updateProfile);
userRouter.put('/update-password',authMiddleware,changePassword);

export default userRouter;