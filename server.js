// ------------------ Imports ------------------
require('dotenv').config(); // load env FIRST

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// ------------------ Route Imports ------------------
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const Course = require('./models/Course');

// ------------------ App Setup ------------------
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'student-portal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true ONLY in HTTPS (Render handles it automatically)
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ------------------ MongoDB Connection ------------------
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('✅ MongoDB connected');

  try {
    const count = await Course.countDocuments();

    if (count === 0) {
      const sampleCourses = [
        { title: 'Intro to Computer Science', description: 'Basics of CS', instructor: 'Dr. Priya Rao' },
        { title: 'Calculus II', description: 'Integration and series', instructor: 'Prof. R. Menon' },
        { title: 'Physics for Engineers', description: 'Mechanics and thermodynamics', instructor: 'Dr. G. Sharma' },
        { title: 'Technical Communication', description: 'Writing for engineers', instructor: 'Ms. S. Iyer' }
      ];

      await Course.insertMany(sampleCourses);
      console.log('✅ Seeded sample courses');
    }

  } catch (err) {
    console.log('⚠️ Seeding skipped:', err.message);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1); // stop app if DB fails
});

// ------------------ Routes ------------------

// Frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/register', '/registration'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API routes
app.use('/api', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});