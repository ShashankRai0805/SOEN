import userModel from '../models/userModel.js';
import userService from '../service/user.service.js';
import { validationResult } from 'express-validator';

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
        });

        if (!user) {
            return res.status(401).json({
                msg: "Invalid email or password"
            })
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