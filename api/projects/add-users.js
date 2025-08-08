import connectDB from '../../lib/mongodb.js';
import Project from '../../lib/projectModel.js';
import { authMiddleware } from '../../lib/auth.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const auth = await authMiddleware(req);
        await connectDB();
        
        const { projectId, users } = req.body;
        
        if (!projectId || !users || !Array.isArray(users)) {
            return res.status(400).json({ 
                errors: [{ msg: 'Project ID and users array are required' }]
            });
        }

        // Validate ObjectIds
        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ 
                errors: [{ msg: 'Invalid project ID' }]
            });
        }

        for (const userId of users) {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).json({ 
                    errors: [{ msg: 'Invalid user ID format' }]
                });
            }
        }

        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the authenticated user is part of the project
        if (!project.users.includes(auth.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Add new users to the project (avoid duplicates)
        const newUsers = users.filter(userId => !project.users.includes(userId));
        project.users.push(...newUsers);

        await project.save();

        const updatedProject = await Project.findById(projectId).populate('users', 'email');

        res.status(200).json({
            message: 'Users added successfully',
            project: updatedProject
        });
    } catch (error) {
        console.error('Add users error:', error);
        if (error.message === 'Authentication failed') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
}
