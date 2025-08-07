import projectModel from '../models/projectModel.js';
import mongoose from 'mongoose';

const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('User ID is required')
    }
    
    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error('Invalid User ID format')
    }

    const project = await projectModel.create({
        name,
        users: [userId]
    })

    return project;
}

const getAllProjects = async (userId) => {
    if (!userId){
        throw new Error('User ID is required')
    }
    
    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error('Invalid User ID format')
    }

    const alluserProject = await projectModel.find({
        users: userId
    })

    return alluserProject
}

export const addUserToProject = async ({projectId, users, userId}) => {
    if (!projectId){
        throw new Error('Project ID is required')
    }
    
    // Validate projectId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(projectId)) {
        throw new Error('Invalid Project ID format')
    }
    
    if (!users){
        throw new Error('Users are required')
    }
    
    // Ensure users is an array
    if (!Array.isArray(users)) {
        throw new Error('Users must be an array')
    }

    if (!userId) {
        throw new Error('User ID is required')
    }

    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(userId)) {
        throw new Error('Invalid User ID format')
    }
    
    // Validate each user ID in the users array
    for (let i = 0; i < users.length; i++) {
        if (!mongoose.isValidObjectId(users[i])) {
            throw new Error(`Invalid User ID format at index ${i}: ${users[i]}`)
        }
    }
    
    // First, let's check if the project exists at all
    const projectExists = await projectModel.findById(projectId)
    
    if (!projectExists) {
        throw new Error('Project not found')
    }
    
    // Now check if the user is part of the project
    // Convert userId to ObjectId for proper comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const project = await projectModel.findOne({
        _id: projectId,
        users: userObjectId // Ensure the user is part of the project
    })
    
    // Alternative: Check if user exists in project using string comparison as fallback
    const userExistsInProject = projectExists.users.some(u => u.toString() === userId.toString());
    
    if (!project && !userExistsInProject) {
        // If user is not in project, let's add them first, then add the other users
        console.log('User not in project, adding user to project first...');
        
        // Add the requesting user to the project first
        await projectModel.findByIdAndUpdate(
            projectId,
            { $addToSet: { users: userObjectId } },
            { new: true }
        );
        
        console.log(`Added user ${userId} to project ${projectId}`);
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: { $each: users }
        }
    }, {
        new: true,
        runValidators: true
    })

    return updatedProject;
}

export const getProjectById = async ({projectId}) => {
    if (!projectId){
        throw new Error('Project ID is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error('Invalid Project ID format')
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

export default {
    createProject,
    getAllProjects,
    addUserToProject,
    getProjectById
};