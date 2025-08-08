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
    
    console.log('Login API called:', req.method);
    console.log('Request body:', req.body);
    
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ message: `Method ${req.method} not allowed. Expected POST.` });
    }

    try {
        await connectDB();
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                errors: [{ msg: 'Email and password are required' }]
            });
        }

        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ msg: 'Invalid email or password' });
        }

        const isMatch = await user.isValidPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid email or password' });
        }

        const token = user.generateJWT();

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
}
