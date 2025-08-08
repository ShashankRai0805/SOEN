import connectDB from '../../lib/mongodb.js';
import User from '../../lib/userModel.js';

export default async function handler(req, res) {
    console.log('Register API called:', req.method);
    console.log('Request body:', req.body);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('Attempting to connect to database...');
        await connectDB();
        console.log('Database connected successfully');
        
        const { email, password } = req.body;
        console.log('Received email:', email);
        
        if (!email || !password) {
            console.log('Missing email or password');
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
