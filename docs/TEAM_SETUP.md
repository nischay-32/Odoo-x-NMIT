# Team Setup Guide

## New Team Member Onboarding

### Prerequisites Checklist
- [ ] GitHub account with access to repository
- [ ] Node.js 18+ installed
- [ ] MongoDB installed (local) or Atlas account (cloud)
- [ ] VS Code installed
- [ ] Git configured with your credentials

### Step-by-Step Setup

#### 1. Repository Access
```bash
# Clone the repository
git clone https://github.com/nischay-32/SynergySphere.git
cd SynergySphere

# Verify access
git remote -v
```

#### 2. VS Code Configuration
```bash
# Open in VS Code
code .

# Install recommended extensions (auto-prompted)
# Extensions will be installed automatically from .vscode/extensions.json
```

#### 3. Environment Setup
```bash
# Backend environment
cp backend/.env.example backend/.env

# Edit backend/.env with your settings:
# - MONGO_URI (your MongoDB connection string)
# - JWT_SECRET (generate a secure secret)
# - PORT (default: 5000)
```

#### 4. Dependencies Installation
```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

#### 5. Database Setup
```bash
# Option A: Local MongoDB
mongod --dbpath /path/to/your/db

# Option B: MongoDB Atlas
# Update MONGO_URI in backend/.env with Atlas connection string
```

#### 6. Verify Setup
```bash
# Start development servers
npm run dev

# Check if both servers are running:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api/v1
```

### Team-Specific Shortcuts

#### VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")
- **Install Dependencies**: Install all project dependencies
- **Start Backend**: Launch backend development server
- **Start Frontend**: Launch frontend development server
- **Run Tests**: Execute all test suites
- **Lint Code**: Check code quality
- **Format Code**: Auto-format all files

#### Custom Scripts
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Code Quality
npm run lint             # Lint all code
npm run format           # Format all code
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run all tests
npm run test:backend     # Backend tests only
npm run test:frontend    # Frontend tests only
npm run test:coverage    # Coverage reports

# Database
npm run db:seed          # Seed development data
npm run db:reset         # Reset database
```

### Team Workflow Integration

#### Git Configuration
```bash
# Set up Git hooks for code quality
npx husky install

# Configure your Git identity
git config user.name "Your Name"
git config user.email "your.email@company.com"
```

#### Branch Naming Convention
```bash
# Feature branches
git checkout -b feature/task-management
git checkout -b feature/user-authentication

# Bug fixes
git checkout -b fix/login-validation
git checkout -b fix/task-drag-drop

# Hotfixes
git checkout -b hotfix/security-patch
```

#### Commit Message Format
```bash
# Use conventional commits
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(tasks): resolve drag-and-drop issue"
git commit -m "docs(api): update endpoint documentation"
```

### Debugging Setup

#### VS Code Debugging
1. Press `F5` or go to Run and Debug panel
2. Select configuration:
   - **Launch Backend**: Debug Node.js backend
   - **Launch Frontend**: Debug React frontend
   - **Launch Full Stack**: Debug both simultaneously

#### Browser DevTools
- React DevTools extension
- Redux DevTools (if using Redux)
- Network tab for API debugging

### Team Communication

#### Code Review Process
1. Create feature branch
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request
5. Request review from 2+ team members
6. Address feedback
7. Merge after approval

#### Issue Reporting
```markdown
## Bug Report Template
**Description**: Brief description of the issue
**Steps to Reproduce**: 
1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Environment**: Browser, OS, Node version
**Screenshots**: If applicable
```

### Performance Monitoring

#### Development Tools
- **Backend**: Morgan logging, debug module
- **Frontend**: React DevTools Profiler
- **Database**: MongoDB Compass for query analysis

#### Metrics to Monitor
- API response times
- Database query performance
- Frontend bundle size
- Memory usage

### Security Guidelines

#### Environment Variables
- Never commit `.env` files
- Use strong JWT secrets
- Rotate secrets regularly
- Use HTTPS in production

#### Code Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement rate limiting

### Troubleshooting Common Issues

#### Port Conflicts
```bash
# Check what's using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev:backend
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
brew services list | grep mongodb

# Start MongoDB service
brew services start mongodb-community

# Check connection string format
mongodb://username:password@host:port/database
```

#### Node Version Issues
```bash
# Check current version
node --version

# Use Node Version Manager
nvm install 18
nvm use 18
nvm alias default 18
```

#### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Team Resources

#### Documentation Links
- [Project README](./README.md)
- [API Documentation](./api.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Deployment Guide](./deployment.md)

#### External Resources
- [React Documentation](https://react.dev)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Express.js Guide](https://expressjs.com/en/guide/)

#### Team Contacts
- **Tech Lead**: [Name] - [email]
- **DevOps**: [Name] - [email]
- **QA Lead**: [Name] - [email]
- **Project Manager**: [Name] - [email]

### Success Checklist

After completing setup, you should be able to:
- [ ] Clone and run the project locally
- [ ] Create and switch between Git branches
- [ ] Run all tests successfully
- [ ] Debug both frontend and backend
- [ ] Lint and format code automatically
- [ ] Create and review pull requests
- [ ] Access all development tools and resources
