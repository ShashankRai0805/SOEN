import userModel from '../models/userModel.js';
import userService from '../service/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../service/redis.service.js';

export const createUserController = async (req, res) => {

    console.log('Request body:', req.body); // Debug log

    const errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        res.status(201).json({
            user,
            token
        })
        
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }

}

export const loginUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const {email, password} = req.body;

        const user = await userModel.findOne({
            email
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                msg: "Invalid email or password"
            })
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                msg: "Invalid email or password"
            });
        }

        const token = await user.generateJWT();

        res.status(200).json({
            user,
            token
        })

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const profileController = async (req, res) => {
    console.log(req.user);

    res.status(200).json({
        user: req.user
    })
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        redisClient.set(token, 'logout', 'EX', 60*60*24);

        res.status(200).json({
            msg: "Logged out successfully"
        })

    } catch (error) {
        console.log('Error during logout:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}