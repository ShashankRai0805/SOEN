import projectModel from '../models/projectModel.js';
import projectService from '../service/project.service.js';
import userModel from '../models/userModel.js';
import { validationResult } from 'express-validator';

export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        const userId = loggedInUser._id;

        const newProject = await projectService.createProject({
            name,
            userId
        })

        return res.status(201).json({
            project: newProject
        })
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({
            error: error.message
        })
    }
}