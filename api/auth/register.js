import connectDB from '../../lib/mongodb.js';
import User from '../../lib/userModel.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                errors: [{ msg: 'Email and password are required' }]
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ 
                errors: [{ msg: 'User already exists' }]
            });
        }

        // Hash password
        const hashedPassword = await User.hashPassword(password);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword
        });

        const token = user.generateJWT();

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
}
