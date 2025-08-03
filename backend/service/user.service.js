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

export default {
    createUser
};