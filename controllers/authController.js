const User = require('../models/User');

exports.login = async (req, res) => {
    res.render('login', { message: req.flash('error') });
};

exports.authenticate = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || user.password !== password) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
    }

    req.session.user = user;
    req.flash('success', 'Login successful! Welcome to your dashboard.');
    res.redirect('/dashboard');
};


exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};

exports.dashboard = async (req, res) => {
    res.render('dashboard'); // No need to pass user, success, error
};




