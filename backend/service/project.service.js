import projectModel from '../models/projectModel.js';

const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('User ID is required')
    }

    const project = await projectModel.create({
        name,
        users: [userId]
    })

    return project;
}

export default {
    createProject
};