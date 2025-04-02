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
const app = express();
const sequelize = require('./config/database');
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'srv871.hstgr.io',
    user: process.env.DB_USER || 'u510451310_Reminderwebapp',
    password: process.env.DB_PASS || 'U510451310_Reminderwebapp',
    database: process.env.DB_NAME || 'u510451310_Reminderwebapp'
});
require('./sendReminders');
require('./reminderJob');
const reminderRoutes = require('./routes/reminderRoutes');
app.use(reminderRoutes);
await sequelize.sync({ alter: false });

app.use(session({
    secret: process.env.SECRET || 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,  // ✅ Store sessions in MySQL
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success = req.flash('success') || [];
    res.locals.error = req.flash('error') || [];
    next();
});

app.use(express.json()); 

app.use(authRoutes);
app.use(categoryRoutes);
app.use(reminderTaskRoutes);
const models = { Category, ReminderTask };

const assetsPath = path.join(__dirname, 'views/assets');
app.use('/assets', express.static(assetsPath));
// Apply Associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        await sequelize.sync({ alter: true }); // Sync with DB
        console.log('✅ Tables synchronized successfully.');
    } catch (error) {
        console.error('❌ Database sync error:', error);
    }

    // Start Server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
