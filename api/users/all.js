import connectDB from '../../lib/mongodb.js';
import User from '../../lib/userModel.js';
import { authMiddleware } from '../../lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const auth = await authMiddleware(req);
        await connectDB();
        
        const users = await User.find({
            _id: { $ne: auth.user._id } // Exclude the logged-in user
        }).select('email _id');

        res.status(200).json({
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        if (error.message === 'Authentication failed') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(500).json({ 
            msg: 'Error fetching users',
            error: error.message 
        });
    }
}
