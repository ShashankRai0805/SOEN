export default async function handler(req, res) {
    console.log('Environment check API called');
    
    const envStatus = {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
        GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY ? 'SET' : 'MISSING',
        timestamp: new Date().toISOString()
    };
    
    console.log('Environment status:', envStatus);
    
    res.status(200).json({
        message: 'Environment check',
        environment: envStatus
    });
}
