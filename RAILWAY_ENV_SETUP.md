# ===============================================================================
# 🚀 BOOKBUDDY AI FICTION EDITING TOOL - ENVIRONMENT VARIABLES
# ===============================================================================
# 
# ⚠️  CRITICAL: ADD THESE TO YOUR RAILWAY DEPLOYMENT ⚠️
# 🔐 REQUIRED FOR AI FICTION EDITING TOOL TO WORK
# 
# 📦 DEPLOYMENT TARGET: Railway (Node.js + React)
# 🤖 AI SERVICE: OpenAI GPT-4 for fiction editing
# 💾 DATABASE: MongoDB for user data and chapters
#
# ===============================================================================

# ===============================================================================
# 🖥️ RAILWAY BACKEND ENVIRONMENT VARIABLES - REQUIRED FOR DEPLOYMENT
# ===============================================================================
# 
# 🚨 ADD THESE EXACT VARIABLES TO RAILWAY DASHBOARD → VARIABLES TAB
# 

# Server Configuration - Production
NODE_ENV=production
PORT=8080

# Database Connection - REQUIRED
# 🔗 Get this from MongoDB Atlas: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookbuddy?retryWrites=true&w=majority

# Authentication & Security - REQUIRED
# 🔐 Generate a secure random string (32+ characters)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
JWT_EXPIRE=7d

# AI Service - REQUIRED FOR CORE FUNCTIONALITY
# 🤖 Get this from OpenAI: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL - Railway serves both frontend and backend
CLIENT_URL=https://your-railway-app.up.railway.app

# Email Service (Optional - for user notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# ===============================================================================
# 🌐 FRONTEND ENVIRONMENT VARIABLES (Built into Backend)
# ===============================================================================
# 
# ℹ️ The React app is built and served by the Express server
# ℹ️ No separate frontend environment variables needed for Railway
#

# ===============================================================================
# 💻 LOCAL DEVELOPMENT ENVIRONMENT VARIABLES
# ===============================================================================
# 
# 📁 CREATE FILE: server/.env for local development
# 📁 CREATE FILE: client/.env for local frontend
#

# Backend (.env in server/ directory):
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-fiction-editing
JWT_SECRET=development-jwt-secret-not-for-production
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Frontend (.env in client/ directory):
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development

# ===============================================================================
# 🚀 QUICK RAILWAY DEPLOYMENT SETUP
# ===============================================================================

# STEP 1: Get Your API Keys
# 🤖 OpenAI API Key: https://platform.openai.com/api-keys
# 💾 MongoDB Atlas: https://cloud.mongodb.com (create free cluster)

# STEP 2: Add Variables to Railway
# 1. Go to Railway Dashboard → Your BookBuddy Project → Variables tab
# 2. Click "Raw Editor" button
# 3. Copy and paste these variables (update MONGODB_URI with your real value):

NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/bookbuddy?retryWrites=true&w=majority
JWT_SECRET=8f3e2a1b9c4d7f6e8a2b5c9d1e4f7a3b8c6d9e2f5a8b1c4d7e9f2a5b8c1d4e7f9a2b5c8d1e4f7a3b6c9d2e5f8
OPENAI_API_KEY=sk-your-openai-api-key-here

# STEP 3: Deploy
# Railway will automatically redeploy after you save the variables

# ===============================================================================
# 🔍 WHAT EACH VARIABLE DOES
# ===============================================================================

# NODE_ENV=production
# → Tells the app it's running in production mode

# PORT=8080  
# → Railway assigns this port automatically

# MONGODB_URI=mongodb+srv://...
# → Connection string to your MongoDB database
# → Stores user accounts, fiction chapters, AI analysis results

# JWT_SECRET=your-secret...
# → Secret key used to sign authentication tokens
# → MUST be secure and random (32+ characters)

# OPENAI_API_KEY=sk-...
# → Your OpenAI API key for GPT-4 AI editing features
# → Core functionality: grammar, style, repetition detection

# CLIENT_URL=https://...
# → The URL where your app will be accessible
# → Used for CORS and frontend routing

# ===============================================================================
# 🛠️ TROUBLESHOOTING
# ===============================================================================

# ❌ "Cannot connect to database"
# → Check MONGODB_URI is correct
# → Verify MongoDB Atlas allows connections from 0.0.0.0/0
# → Check username/password in connection string

# ❌ "OpenAI API calls failing"  
# → Verify OPENAI_API_KEY starts with 'sk-'
# → Check you have credits in your OpenAI account
# → Confirm API key has proper permissions

# ❌ "JWT authentication errors"
# → Ensure JWT_SECRET is set and secure
# → Check it's the same across all instances

# ❌ "Build fails on Railway"
# → Check all required variables are set
# → Verify nixpacks.toml only has 'nodejs_18' (not 'npm')

# ===============================================================================
# 🎯 CURRENT MISSING VARIABLES FOR YOUR RAILWAY DEPLOYMENT
# ===============================================================================

# Based on your current setup, you need to add these to Railway:

# ===============================================================================
# 🎯 READY TO DEPLOY - COPY THESE TO RAILWAY NOW!
# ===============================================================================

NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://scosom:nonphubic4@brainstorm-cluster.bg60my0.mongodb.net/bookbuddy?retryWrites=true&w=majority&appName=Brainstorm-Cluster
JWT_SECRET=8f3e2a1b9c4d7f6e8a2b5c9d1e4f7a3b8c6d9e2f5a8b1c4d7e9f2a5b8c1d4e7f9a2b5c8d1e4f7a3b6c9d2e5f8
OPENAI_API_KEY=sk-your-openai-api-key-here

# ✅ ALL VARIABLES COMPLETE - READY FOR RAILWAY DEPLOYMENT!
# 🚀 Copy the above 5 lines and paste into Railway Dashboard → Variables → Raw Editor

# ===============================================================================
