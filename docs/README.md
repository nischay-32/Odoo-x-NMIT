# SynergySphere - Team Collaboration Platform

## Project Overview

SynergySphere is an advanced team collaboration platform designed to streamline project management, task tracking, and team communication for modern development teams.

### Architecture

```
SynergySphere/
├── backend/           # Node.js/Express API server
├── frontend/          # React/Vite client application
├── docs/             # Project documentation
└── .vscode/          # Shared VS Code configuration
```

## Quick Start

### For New Team Members

1. **Clone Repository**
   ```bash
   git clone https://github.com/nischay-32/SynergySphere.git
   cd SynergySphere
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install:all
   
   # Or install separately
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Edit with your local settings
   nano backend/.env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if using local instance)
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGO_URI in .env file
   ```

5. **Start Development**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately
   npm run dev:backend    # Backend on port 5000
   npm run dev:frontend   # Frontend on port 3000
   ```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **API Documentation**: http://localhost:5000/api/docs

## Team Development

### VS Code Setup

The project includes shared VS Code configuration:
- **Extensions**: Auto-installed recommended extensions
- **Settings**: Consistent formatting and linting
- **Tasks**: Pre-configured build and run tasks
- **Debugging**: Full-stack debugging configuration

### Code Standards

- **Linting**: ESLint with React and Node.js rules
- **Formatting**: Prettier with consistent style
- **Git Hooks**: Pre-commit linting and formatting
- **Testing**: Jest for backend, Vitest for frontend

### Branching Strategy

```
main (production)
├── develop (integration)
│   ├── feature/user-auth
│   ├── feature/task-board
│   └── feature/team-management
└── hotfix/critical-fixes
```

## Core Features

### 🔐 Authentication System
- JWT-based authentication
- Role-based access control (Admin/Member)
- Secure password hashing
- Session management

### 📊 Project Management
- Create and manage projects
- Project status tracking
- Team member assignment
- Project settings and configuration

### ✅ Task Management
- Kanban-style task board
- Drag-and-drop task status updates
- Task assignment and priority
- Bulk task operations
- Task filtering and search

### 👥 Team Collaboration
- Add/remove team members
- Role management (Admin/Member)
- Bulk member operations
- Member search and filtering

### 🎨 Modern UI/UX
- Responsive design (mobile-first)
- Dark/light theme support
- Intuitive drag-and-drop interface
- Real-time updates

## API Endpoints

### Authentication
```
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login
GET  /api/v1/auth/me          # Get current user
GET  /api/v1/auth/logout      # User logout
```

### Projects
```
GET    /api/v1/projects           # Get user projects
POST   /api/v1/projects           # Create project
GET    /api/v1/projects/:id       # Get project details
PATCH  /api/v1/projects/:id       # Update project
DELETE /api/v1/projects/:id       # Delete project
```

### Tasks
```
GET    /api/v1/projects/:id/tasks     # Get project tasks
POST   /api/v1/projects/:id/tasks     # Create task
GET    /api/v1/tasks/:id              # Get task details
PATCH  /api/v1/tasks/:id              # Update task
DELETE /api/v1/tasks/:id              # Delete task
```

### Team Management
```
GET    /api/v1/teams/:projectId/members           # Get team members
POST   /api/v1/teams/:projectId/members           # Add member
DELETE /api/v1/teams/:projectId/members/:id       # Remove member
PATCH  /api/v1/teams/:projectId/members/:id/role  # Update role
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, XSS protection
- **Validation**: Express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Development Tools
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest (backend), Vitest (frontend)
- **Version Control**: Git with conventional commits
- **IDE**: VS Code with shared configuration

## Environment Variables

### Backend (.env)
```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/synergysphere

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_LIFETIME=30d

# CORS
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=SynergySphere
VITE_APP_VERSION=1.0.0
```

## Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                   # Component tests
npm run test:ui            # Test UI
npm run test:coverage      # Coverage report
```

## Deployment

### Development
```bash
npm run dev                # Start development servers
```

### Production Build
```bash
npm run build             # Build both frontend and backend
npm run start             # Start production server
```

### Docker Deployment
```bash
docker-compose up -d      # Start with Docker
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   
   # Or change port in .env
   PORT=5001
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   brew services list | grep mongodb
   
   # Start MongoDB
   brew services start mongodb-community
   ```

3. **Node Version Issues**
   ```bash
   # Use Node Version Manager
   nvm use 18
   nvm install 18
   ```

### Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Create GitHub issue
- **Team Chat**: Use project communication channels
- **Code Review**: Request help in PR comments

## Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines on:
- Development workflow
- Code standards
- Testing requirements
- Pull request process

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
