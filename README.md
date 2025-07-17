# AI Fiction Editing Tool

A comprehensive web-based AI-powered fiction editing tool with full accessibility support and built-in debugging console.

## Features

- **User Authentication**: Secure signup/login with JWT
- **Rich Text Editor**: Full formatting support with accessibility
- **AI Editing**: Automatic corrections for typos, grammar, and dialogue
- **Repetition Detection**: Smart flagging of repeated words and phrases
- **Consistency Checking**: Cross-chapter name and place tracking
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Debugging Console**: Built-in F12 debugging with live logs and state inspection
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
# Copy example env files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Update environment variables with your values:
- OpenAI API key
- MongoDB connection string
- JWT secret

4. Start development servers:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment on Railway

### Quick Railway Deployment:

1. **Connect GitHub to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select this repository

2. **Add Environment Variables in Railway Dashboard:**
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-long-random-secret-key
   NODE_ENV=production
   ```

3. **Optional - Add MongoDB:**
   - In Railway, add a MongoDB plugin to your project
   - Copy the connection string to MONGODB_URI

4. **Deploy:**
   - Railway will automatically deploy when you push to main
   - Build command: `npm run build`
   - Start command: `npm start`

**That's it!** Your app will be available at your Railway URL.

### Environment Variables Needed:
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `MONGODB_URI` (required) - MongoDB connection string  
- `JWT_SECRET` (required) - Long random string for JWT tokens
- `NODE_ENV=production` (required)
- Email settings (optional, for password reset)

## Local Development

- Semantic HTML5 structure
- ARIA roles and labels throughout
- Full keyboard navigation support
- Screen reader compatibility
- Adjustable font sizes and color schemes
- High contrast mode support

## Built-in Debugging Console

Press F12 to open the debugging console which includes:
- Live action logs
- Error reporting with stack traces
- State inspection
- AI interaction logs
- Network request monitoring
- Performance metrics
- Accessibility audit
- Log export functionality

## Architecture

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Rich Text**: Slate.js editor
- **AI Integration**: OpenAI API
- **Styling**: CSS modules with accessibility

## Contributing

This codebase is designed to be modular and extensible. See the developer guide in `/docs` for more information.

## License

MIT License - see LICENSE file for details.
