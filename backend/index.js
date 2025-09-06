require("dotenv").config();
require('express-async-errors');

const express = require("express");
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const fileUpload = require('express-fileupload')
const rateLImiter  =require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize')


// Database Connection
const connectDb = require("./db/connectDb");

// Routers
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');


app.set('trust proxy', 1);
app.use(rateLImiter({
  windowMs:15*0*1000,
  max:60,
}));
app.use(helmet())
app.use(xss());
app.use(mongoSanitize())
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload())
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));




//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/teams', teamRoutes); // Team management routes
app.use('/api/v1', taskRoutes); // Task management routes - mount at root to handle /projects/:id/tasks
app.use('/api/v1/comments', commentRoutes); // Comment management routes


//middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
