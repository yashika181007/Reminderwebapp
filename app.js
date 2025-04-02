const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();
const db = require('./config/database'); // Sequelize instance
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reminderTaskRoutes = require('./routes/reminderTaskRoutes');
const Category = require('./models/Category');
const ReminderTask = require('./models/ReminderTask');
const reminderRoutes = require('./routes/reminderRoutes');

const app = express();
const sequelize = require('./config/database');

require('./sendReminders');
require('./reminderJob');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.json());

// Middleware for session data in templates
app.use(session({
    secret: process.env.SECRET || 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,  // ✅ Store sessions in MySQL
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Ensure session is available before using it
app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('Session not initialized'));
    }
    res.locals.user = req.session.user || null;
    res.locals.success = req.flash('success') || [];
    res.locals.error = req.flash('error') || [];
    next();
});

// Serve static assets
const assetsPath = path.join(__dirname, 'views/assets');
app.use('/assets', express.static(assetsPath));

app.use(authRoutes);
app.use(categoryRoutes);
app.use(reminderTaskRoutes);
app.use(reminderRoutes);

const models = { Category, ReminderTask };
// Apply Associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

// Start server inside an async IIFE
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        await sequelize.sync({ alter: true }); // Ensure tables are up to date
        console.log('✅ Tables synchronized successfully.');

        // Initialize session store after DB connection
        const sessionStore = new MySQLStore({
            host: process.env.DB_HOST || 'srv871.hstgr.io',
            user: process.env.DB_USER || 'u510451310_Reminderwebapp',
            password: process.env.DB_PASS || 'U510451310_Reminderwebapp',
            database: process.env.DB_NAME || 'u510451310_Reminderwebapp'
        });

        // Session Middleware
        app.use(session({
            secret: process.env.SECRET || 'mysecret',
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour
        }));

        // Start the server
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error('❌ Database sync error:', error);
    }
})();
