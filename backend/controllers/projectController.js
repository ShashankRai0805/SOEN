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

export const getAllProject = async (req, res) => {
    try {
        
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        });

        const alluserProject = await projectService.getAllProjects(loggedInUser._id)
        return res.status(200).json({
            projects: alluserProject
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({
            msg: "Project not found",
            error: error.message
        })
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        
        const { projectId, users} = req.body;

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const project = await projectService.addUserToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message
        })
    }
}

export const getProjectById = async (req, res) => {
    const {projectId} = req.params;

    try {
        const project = await projectService.getProjectById({projectId});

        return res.status(200).json({
            project
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message
        })
    }
}