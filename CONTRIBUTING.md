# Contributing to SynergySphere

## Team Development Workflow

### Branching Strategy

We follow a **Git Flow** branching model:

```
main (production)
├── develop (integration)
│   ├── feature/task-management
│   ├── feature/user-authentication
│   └── feature/project-dashboard
├── hotfix/critical-bug-fix
└── release/v1.0.0
```

#### Branch Types:
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New features (branch from develop)
- **hotfix/***: Critical fixes (branch from main)
- **release/***: Release preparation (branch from develop)

### Code Review Process

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   - Write code following our coding standards
   - Add tests for new functionality
   - Run linting and formatting: `npm run lint && npm run format`

3. **Pre-commit Checklist**
   - [ ] Code follows ESLint rules
   - [ ] All tests pass
   - [ ] No console.log statements
   - [ ] Documentation updated if needed

4. **Create Pull Request**
   - Push to your feature branch
   - Create PR to `develop` branch
   - Fill out PR template completely
   - Request review from at least 2 team members

5. **Code Review Requirements**
   - At least 2 approvals required
   - All CI checks must pass
   - No merge conflicts
   - Documentation updated

### Commit Message Convention

Follow **Conventional Commits** format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(tasks): resolve drag-and-drop state issue
docs(api): update team management endpoints
```

### Development Environment Setup

1. **Prerequisites**
   - Node.js 18+
   - npm 9+
   - Git 2.30+
   - MongoDB 6.0+

2. **Initial Setup**
   ```bash
   git clone https://github.com/nischay-32/SynergySphere.git
   cd SynergySphere
   npm run setup  # Installs all dependencies
   ```

3. **Environment Configuration**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your local settings
   ```

4. **Start Development**
   ```bash
   npm run dev  # Starts both frontend and backend
   ```

### Testing Guidelines

#### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

#### Frontend Testing
```bash
cd frontend
npm test                   # Run component tests
npm run test:e2e          # End-to-end tests
```

#### Test Requirements
- Unit tests for all new functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

### Code Quality Standards

#### JavaScript/React Standards
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript for type safety

#### API Standards
- RESTful endpoint design
- Proper HTTP status codes
- Consistent error response format
- Input validation and sanitization

#### Database Standards
- Use Mongoose schemas with validation
- Implement proper indexing
- Follow MongoDB best practices
- Handle connection errors gracefully

### Team Communication

#### Daily Standups
- What did you work on yesterday?
- What will you work on today?
- Any blockers or help needed?

#### Code Review Guidelines
- Be constructive and respectful
- Focus on code, not the person
- Suggest improvements with examples
- Approve when standards are met

#### Issue Management
- Use GitHub Issues for bug reports
- Use GitHub Projects for feature planning
- Label issues appropriately
- Assign issues to team members

### Deployment Process

#### Staging Deployment
1. Merge to `develop` branch
2. Automated deployment to staging
3. Run smoke tests
4. Team review and approval

#### Production Deployment
1. Create release branch from `develop`
2. Final testing and bug fixes
3. Merge to `main` branch
4. Tag release version
5. Deploy to production
6. Monitor for issues

### Emergency Procedures

#### Hotfix Process
1. Create hotfix branch from `main`
2. Fix critical issue
3. Test thoroughly
4. Deploy to production immediately
5. Merge back to `develop` and `main`

#### Rollback Process
1. Identify problematic deployment
2. Revert to previous stable version
3. Investigate root cause
4. Implement proper fix
5. Redeploy when ready

### Resources

- [Project Documentation](./docs/README.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)
