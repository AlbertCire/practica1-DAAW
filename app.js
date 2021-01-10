const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const helpers = require('./helpers');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorHandlers = require('./handlers/errorHandlers');
const passport = require('passport');
require('./handlers/passport');


// create our Express app
const app = express();
// serves up static files from the public folder.
app.use(express.static(path.join(__dirname, 'public')));
// VIEWS: this is the folder where we keep our pug files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); // we use the engine pug
//Express body-parser implementation -> access to req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    //the session is stored in the DB
    stay: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash();
    res.locals.currentPath = req.path;
    res.locals.user = req.user || null;
    next(); //Go to the next middleware in the REQ-RES CYCLE
});

//ROUTER: anytime someone goes to "/anything", we will handle it with the module "routes"
app.use('/', routes);

// If above routes didnt work -> error 404 and forward to error handler
app.use(errorHandlers.notFound);
//if errors are just BD validation errors -> show them in flashes
app.use(errorHandlers.flashValidationErrors);
// Otherwise this was a really bad error we didn't expect!
if (app.get('env') === 'development') {
    /* Development Error Handler - Prints stack trace */
    app.use(errorHandlers.developmentErrors);
}
/* production error handler */
app.use(errorHandlers.productionErrors);


module.exports = app;