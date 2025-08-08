# SEON Chat App - Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Option B: Using Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Environment Variables in Vercel
Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_AI_KEY=your_google_ai_api_key
REDIS_HOST=your_redis_host (optional)
REDIS_PORT=your_redis_port (optional)
REDIS_PASSWORD=your_redis_password (optional)
```

## 📁 Project Structure

```
SEON/
├── api/                 # Vercel serverless functions
│   ├── auth/           # Authentication endpoints
│   ├── projects/       # Project management endpoints
│   ├── users/          # User management endpoints
│   └── ai/             # AI assistant endpoints
├── lib/                # Shared utilities and models
├── src/                # React frontend source
├── public/             # Static files
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies and scripts
```

## 🔧 API Endpoints

### Production (Vercel)
- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users/all`, `/api/users/profile`
- **Projects**: `/api/projects`, `/api/projects/add-users`
- **AI**: `/api/ai/get-result`

### Development (Local Backend)
- **Authentication**: `/users/login`, `/users/register`
- **Users**: `/users/all`, `/users/profile`
- **Projects**: `/projects/create`, `/projects/all`, `/projects/add-user`
- **AI**: `/ai/get-result`

## ⚠️ Important Notes

### Socket.io Limitation
Vercel serverless functions don't support persistent WebSocket connections. For real-time chat functionality, you have two options:

#### Option 1: Deploy Backend Separately (Recommended)
Deploy your existing backend to Railway, Render, or Heroku:
```javascript
const SOCKET_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-on-railway.up.railway.app' 
    : 'http://localhost:3001';
```

#### Option 2: Use Vercel Edge Functions (Limited)
Use Vercel's experimental WebSocket support (limited features).

### Database Connections
The serverless functions use connection pooling to handle MongoDB connections efficiently.

## 🧪 Testing

### Local Development
```bash
npm run dev  # Frontend on http://localhost:5173
# Backend on http://localhost:3001 (separate terminal)
```

### Production Testing
After deployment, test all features:
- [ ] User registration/login
- [ ] Project creation
- [ ] AI assistant
- [ ] User management

## 📋 Deployment Checklist
- [ ] Environment variables set in Vercel
- [ ] MongoDB connection string updated
- [ ] Google AI API key configured
- [ ] All API endpoints working
- [ ] Frontend routes functioning
- [ ] Socket.io backend deployed separately (if needed)

## 🔍 Troubleshooting

### Common Issues
1. **API calls failing**: Check environment variables and endpoint paths
2. **Database connection errors**: Verify MongoDB URI and network access
3. **Build failures**: Check for missing dependencies in package.json
4. **CORS errors**: Verify API routes are correctly configured

### Debugging
- Check Vercel function logs in the dashboard
- Use browser developer tools for frontend debugging
- Test API endpoints directly in Postman/curl

## 🚀 Go Live!
Once deployed, your app will be available at `https://your-project-name.vercel.app`
