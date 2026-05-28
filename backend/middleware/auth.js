import jwt from 'jsonwebtoken';
import user from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET||'your_jwt_secret_key';

export default async function authMiddleware(req,res,next){
    //grab bearer token from header
    const authHeader = req.headers.authorization;
    if(!authHeader||!authHeader.startsWith('Bearer ')){
        return res.status(401).json({success:false,message:'Unauthorized'})
    }
    const token = authHeader.split(' ')[1];

    //verify and attch user to request
    try{
        const payload = jwt.verify(token,JWT_SECRET);
        const userId = payload.userId;
        const authUser = await user.findById(userId).select('-password');

        if(!authUser){
            return res.status(401).json({success:false,message:'Unauthorized'})
        }
        req.userId = userId;
        req.user = authUser;
        next();
    }
    catch(error){
        console.error("Auth error:  JWT failed",error);
        return res.status(401).json({success:false,message:'Unauthorized'})
    }
}