import connectDB from '../lib/mongodb.js';
import User from '../lib/userModel.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    console.log('Auth API called:', req.method);
    console.log('Query params:', req.query);
    console.log('Request body:', req.body);

    try {
        await connectDB();
        console.log('Database connected');

        const { action } = req.query;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                errors: [{ msg: 'Email and password are required' }]
            });
        }

        // Handle registration
        if (action === 'register') {
            console.log('Processing registration...');
            
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

            console.log('User created successfully:', user.email);
            
            return res.status(201).json({
                user: {
                    _id: user._id,
                    email: user.email
                },
                token
            });
        }

        // Handle login
        if (action === 'login') {
            console.log('Processing login...');
            
            const user = await User.findOne({ email }).select('+password');
            
            if (!user) {
                return res.status(401).json({ msg: 'Invalid email or password' });
            }

            const isMatch = await user.isValidPassword(password);
            
            if (!isMatch) {
                return res.status(401).json({ msg: 'Invalid email or password' });
            }

            const token = user.generateJWT();

            console.log('User logged in successfully:', user.email);

            return res.status(200).json({
                user: {
                    _id: user._id,
                    email: user.email
                },
                token
            });
        }

        return res.status(400).json({ message: 'Invalid action. Use ?action=login or ?action=register' });
        
    } catch (error) {
        console.error('Auth API error:', error);
        return res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
}
