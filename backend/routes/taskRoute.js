import express from 'express';
import authMiddleware from '../middleware/auth.js';
import{getTasks,createTask,getTaskbyId,updateTask,deleteTask,searchTasksByName} from '../controllers/taskController.js';

const taskRouter = express.Router();

taskRouter.route('/gp')
.get(authMiddleware,getTasks)
.post(authMiddleware,createTask);

taskRouter.get('/search', authMiddleware, searchTasksByName);

taskRouter.route('/:id/gp')
.get(authMiddleware,getTaskbyId)//only get if task belongs to user
.put(authMiddleware,updateTask)//only update if task belongs to user
.delete(authMiddleware,deleteTask);//only delete if task belongs to user

export default taskRouter;