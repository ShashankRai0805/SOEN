import jwt from 'jsonwebtoken';
import connectDB from './mongodb.js';
import User from './userModel.js';

export const authMiddleware = async (req) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await connectDB();
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        return {
            user: {
                _id: user._id,
                email: user.email
            }
        };
    } catch (error) {
        throw new Error('Authentication failed');
    }
};
