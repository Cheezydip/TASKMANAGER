import User from'../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET||'your_jwt_secret_key';
const TOKEN_EXPIRES = '24h';

const createToken=(userId)=> {
    return jwt.sign({userId},JWT_SECRET,{expiresIn:TOKEN_EXPIRES})
}
//REGISTER FUNCTION
export async function registerUser(req,res){
    const{name,email,password}=req.body;

    if(!name||!email||!password){
        return res.status(400).json({success:false,message:'Please fill all the fields'})
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({success:false,message:'Please enter a valid email'})
    }
    if(password.length<8)
    {
        return res.status(400).json({success:false,message:'Password must be at least 8 characters'})
    }

    try{
        if(await User.findOne({email})){
            return res.status(409).json({success:false,message:'User already exists'})
        }
        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({
            name,
            email,
            password:hashed
        });
        const token = createToken(user._id);
        return res.status(201).json({success:true,token,user:{id:user._id,name:user.name,email:user.email},message:'User registered successfully'})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Server error'})
    }

}

//login function
export async function loginUser(req,res){
    const{email,password}=req.body;
    if(!email||!password)
    {
        return res.status(400).json({success:false,message:'Email and password are required'})
    }

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false,message:'Invalid credentials'})
        }

        const  match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(400).json({success:false,message:'Invalid credentials'})
        }

    const token = createToken(user._id);
        res.json({success:true,token,user:{id:user._id,name:user.name,email:user.email},message:'Login successful'})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Server error'})
    }
}

//get current user function
export async function getCurrentUser(req,res){
    try{
        const user = await User.findById(req.userId).select("name email");
        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        res.json({success:true,user})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Server error'})
    }
}

//update user profile
export async function updateProfile(req,res){
    const {name,email}=req.body;
    if(!name||!email||!validator.isEmail(email)){
        return res.status(400).json({success:false,message:'Name and email are required'})
    }
    try{
        const userexists = await User.findOne({email,_id:{$ne:req.userId}});
        if(userexists){
            return res.status(400).json({success:false,message:'Email already in use by another account'})
        }
        const user = await User.findByIdAndUpdate(req.userId,{name,email},{new:true,runValidators:true}).select("name email");   
        res.json({success:true,user})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Server error'})
    }
}

//change password
export async function changePassword(req,res){
    const{currentPassword,newPassword}=req.body;
    if(!currentPassword||!newPassword||newPassword.length<8){
        return res.status(400).json({success:false,message:'Current and new password are required. New password must be at least 8 characters'})
    }

    try{
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json({success:false,message:'User not found'})
        }
        const match = await bcrypt.compare(currentPassword,user.password);
        if(!match){
            return res.status(400).json({success:false,message:'Current password is incorrect'})
        }
        const hashed = await bcrypt.hash(newPassword,10);
        user.password = hashed;
        await user.save();
        res.json({success:true,message:'Password changed successfully'})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:'Server error'})
    }
}