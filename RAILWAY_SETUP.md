# Railway Environment Variables Setup

## Required Environment Variables for Railway Deployment:

### 1. OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

### 2. MongoDB (use Railway's MongoDB plugin or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/ai-fiction-editing

### 3. JWT Secret (generate a long random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-very-long-and-random

### 4. Environment
NODE_ENV=production

### 5. Optional Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

## Railway Deployment Steps:

1. Connect your GitHub repo to Railway
2. Add the environment variables above in Railway dashboard
3. Railway will automatically detect this as a Node.js project
4. It will run: npm run build && npm start

## MongoDB Options:
- Use Railway's MongoDB plugin (easiest)
- Or use MongoDB Atlas free tier
- Or any other MongoDB hosting service

Just add these environment variables in your Railway project settings!
