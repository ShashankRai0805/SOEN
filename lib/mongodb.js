import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        console.log('Attempting MongoDB connection...');
        console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        console.error('Error details:', error.message);
        throw error;
    }
};

export default connectDB;
