import Task from '../models/taskModel.js';

// Create a new task
export const createTask= async(req,res)=>{
    try{
        const{title,description,priority,dueDate,completed}=req.body;
        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            owner:req.user._id,
            completed:completed==='Yes'||completed==true,
        });
        const savedTask = await task.save();
        res.status(201).json({success:true, task:savedTask});
    } catch (error) {
        res.status(400).json({ success:false, message: error.message });
    }};

// Get all tasks for logged in user
export const getTasks = async (req, res) => {
    try{
        const task = await Task.find({owner:req.user._id}).sort({createdAt:-1});
        res.status(200).json({success:true, tasks:task});
    } catch (error) {
        res.status(500).json({ success:false, message: error.message });
    }
}

//get single task by user
export const getTaskbyId = async(req,res)=>{
    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id});
        if(!task) return res.status(404).json({success:false, message:'Task not found'});
        res.status(200).json({success:true, task});
    } catch (error) {
        res.status(500).json({ success:false, message: error.message });
    }
}
//update task by id
export const updateTask = async(req,res)=>{
    try{
        const data = {...req.body};
        if(data.completed!==undefined){
            data.completed = data.completed === 'Yes' || data.completed === true;
        }
        const updated =await Task.findOneAndUpdate(
            {_id:req.params.id,owner:req.user._id},
            data,
            {new:true,runValidators:true}
        );
        if(!updated) return res.status(404).json({success:false, message:'Task not found'});
        res.status(200).json({success:true, task:updated});
    } catch (error) {
        res.status(500).json({ success:false, message: error.message });
    }};
//delete task by id
export const deleteTask = async(req,res)=>{
    try{
        const deleted = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});//only delete if task belongs to user
        if(!deleted) return res.status(404).json({success:false, message:'Task not found or not yours'});
        res.json(200).json({success:true, message:'Task deleted successfully'});
    } catch (error) {
        res.status(500).json({ success:false, message: error.message });
    }
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

//search task by name for logged in user
export const searchTasksByName = async (req, res) => {
    try {
        const raw = (req.query.name || req.query.q || '').trim()
        if (!raw) {
            return res.status(400).json({ success: false, message: 'Search term is required' })
        }
        const regex = new RegExp(escapeRegExp(raw), 'i')
        const tasks = await Task.find({ owner: req.user._id, title: regex }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, tasks })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}