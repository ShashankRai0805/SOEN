import { authMiddleware } from '../../lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const auth = await authMiddleware(req);
        
        res.status(200).json({
            user: auth.user
        });
    } catch (error) {
        console.error('Profile error:', error);
        if (error.message === 'Authentication failed') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
}
