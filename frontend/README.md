# SynergySphere Frontend

A modern React frontend for the SynergySphere team collaboration platform.

## Features

- **Landing Page**: Modern, responsive landing page showcasing platform features
- **Authentication**: Login and signup pages with form validation
- **Dashboard**: Project overview with search and filtering capabilities
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, intuitive interface with Lucide React icons

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful, customizable icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── LandingPage.jsx # Home/landing page
│   ├── LoginPage.jsx   # User login
│   ├── SignupPage.jsx  # User registration
│   └── Dashboard.jsx   # Main dashboard
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend is configured to work with the SynergySphere backend API running on `http://localhost:5000`. The Vite proxy configuration handles API requests automatically.

## Authentication

The app uses JWT-based authentication with HTTP-only cookies. The AuthContext provides:
- User state management
- Login/logout functionality
- Protected route handling
- Automatic token refresh

## Responsive Design

The UI is built with mobile-first principles:
- Responsive grid layouts
- Mobile-optimized navigation
- Touch-friendly interactions
- Adaptive typography and spacing

## Development

- Run `npm run dev` to start the development server
- The app will be available at `http://localhost:3000`
- Hot reload is enabled for fast development
- ESLint is configured for code quality

## Deployment

Build the app for production:
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.
