import userModel from '../models/userModel.js';

const createUser = async (userData = {}) => {
    const { email, password } = userData;
    
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const hashPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        email,
        password: hashPassword
    });

    return user;
}

export const getAllUsers = async ({userId}) => {
    try {
        const users = await userModel.find({
            _id: { $ne: userId } // Exclude the logged-in user
        })

        return users;
        } catch (error) {
            throw new Error('Error fetching users');
        }
}

export default {
    createUser,
    getAllUsers
};