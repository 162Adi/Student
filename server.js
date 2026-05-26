require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const Course = require('./models/Course');

const app = express();

// ---------------- Middleware ----------------

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'student-portal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// ---------------- Routes ----------------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/register', '/registration'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.use('/api', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------- MongoDB ----------------

const MONGODB_URI = process.env.MONGODB_URI;

console.log("Using DB:", MONGODB_URI);

async function connectDB() {
  try {

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });

    console.log('✅ MongoDB connected');

    const count = await Course.countDocuments();

    if (count === 0) {

      const sampleCourses = [
        {
          title: 'Intro to Computer Science',
          description: 'Basics of CS',
          instructor: 'Dr. Priya Rao'
        },
        {
          title: 'Calculus II',
          description: 'Integration and series',
          instructor: 'Prof. R. Menon'
        },
        {
          title: 'Physics for Engineers',
          description: 'Mechanics and thermodynamics',
          instructor: 'Dr. G. Sharma'
        },
        {
          title: 'Technical Communication',
          description: 'Writing for engineers',
          instructor: 'Ms. S. Iyer'
        }
      ];

      await Course.insertMany(sampleCourses);

      console.log('✅ Sample courses seeded');
    }

  } catch (err) {

    console.error('❌ MongoDB connection error:');
    console.error(err.message);

    process.exit(1);
  }
}

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {

  console.log(`🚀 Server running on port ${PORT}`);

  await connectDB();

});