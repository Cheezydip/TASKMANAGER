import express from 'express'
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';
const app=express();
const port = process.env.PORT || 5000;
//middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}))

//DB Connect
connectDB();


//routes
app.use('/api/user',userRouter); 
app.use('/api/task',taskRouter);
app.get('/',(req,res)=>{
    res.send("API is running");
})

//listen
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})