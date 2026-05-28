//connect database
import mongoose from 'mongoose';

const connectDB=async()=>{
    const mongoURI = process.env.MONGO_URI

    if (!mongoURI) {
        console.warn('MONGO_URI is not set. Skipping database connection.')
        return
    }

    try {
        await mongoose.connect(mongoURI)
        console.log('Database connected successfully')
    } catch (error) {
        console.error('Database connection failed:', error.message)
    }

}

export default connectDB