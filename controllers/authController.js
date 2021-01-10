const passport = require('passport');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/stays/',
    successFlash: 'You are now logged in'
});

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login'});
};

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/stays/');
};

//MIDDLEWARE FUNCTION: verify whether the user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next(); //carry on!
        return;
    }
    req.flash('error', 'you must be logged in to do that');
    res.redirect('/login');
};
