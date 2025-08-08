import connectDB from '../../lib/mongodb.js';
import User from '../../lib/userModel.js';

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
    
    console.log('Register API called:', req.method);
    console.log('Request body:', req.body);
    
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: `Method ${req.method} not allowed. Expected POST.` });
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
