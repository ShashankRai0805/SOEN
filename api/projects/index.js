import connectDB from '../../lib/mongodb.js';
import Project from '../../lib/projectModel.js';
import { authMiddleware } from '../../lib/auth.js';

export default async function handler(req, res) {
    try {
        const auth = await authMiddleware(req);
        await connectDB();
        
        if (req.method === 'POST') {
            const { name } = req.body;
            
            if (!name) {
                return res.status(400).json({ 
                    errors: [{ msg: 'Name is required' }]
                });
            }

            const project = await Project.create({
                name,
                users: [auth.user._id]
            });

            return res.status(201).json({
                project: {
                    _id: project._id,
                    name: project.name,
                    users: project.users
                }
            });
        } else if (req.method === 'GET') {
            const projects = await Project.find({
                users: auth.user._id
            }).populate('users', 'email');

            return res.status(200).json({
                projects
            });
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Projects error:', error);
        if (error.message === 'Authentication failed') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
}
