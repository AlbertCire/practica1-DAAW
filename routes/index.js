const express = require('express');
const router = express.Router();
const stayController = require('../controllers/stayController');
const { catchErrors } = require('../handlers/errorHandlers');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');


router.get('/', catchErrors(stayController.getStays));

router.get('/extendinglayout/', (req, res) => {

    menu = [
        { slug: '/stays', title: 'Stays', },
        { slug: '/tags', title: 'Tags', },
        { slug: '/top', title: 'Top', },
        { slug: '/add', title: 'Add', },
    ];

    res.render('extendingLayout', {
        title: 'My AirBnB',
        menu: menu
    });
});

router.get('/index/', stayController.homePage);


//1st step ADD STAY -> show the form
router.get('/add/',
    authController.isLoggedIn,
    stayController.addStay
);
//2nd step ADD STAY -> receive the data
router.post('/add/',
    //userController.userIsHost,
    authController.isLoggedIn,
    stayController.verify, //verify type image
    catchErrors(stayController.upload), //resize and upload to filesystem
    catchErrors(stayController.createStay) //save in DB
);

// SHOW a certain STAY
router.get('/stay/:slug', catchErrors(stayController.getStayBySlug));

// SHOW all STAYs
router.get('/stays', catchErrors(stayController.getStays));

// SHOW all STOREs with PAGINATION
router.get('/stays/page/:page', catchErrors(stayController.getStays));

//1st step EDIT STAY -> show the form with current data
router.get('/stays/:id/edit', catchErrors(stayController.editStay));
//2nd step EDIT STAY -> receive the updated data
router.post('/add/:id',
 stayController.verify,
 catchErrors(stayController.upload),
 catchErrors(stayController.updateStay)
);

//***API REST --> Functions offered to be consumed by the frontend via AJAX

//req.query -> /api/v1/search?q=hola
router.get('/api/v1/search', catchErrors(stayController.searchStays));

// SHOW all TAGs
router.get('/tags', catchErrors(stayController.getStaysByTag));
//SHOW a certain TAG
router.get('/tags/:tag', catchErrors(stayController.getStaysByTag));

//1st step SIGN-UP a USER -> show the form
router.get('/register', userController.registerForm);
//2nd step SIGN-UP a USER -> validate, register, login
router.post('/register',
    userController.validationRules(),
    userController.validationCustomRules(),
    userController.validateRegister,
    userController.register,
    authController.login
);

//1st step LOG IN -> show the form
router.get('/login', authController.loginForm);
//2nd step LOG IN -> do the login
router.post('/login', authController.login);

//LOG OUT
router.get('/logout', authController.logout);

// SHOW ACCOUNT
router.get('/account',
    authController.isLoggedIn,
    userController.account
);
// EDIT ACCOUNT
router.post('/account',
    authController.isLoggedIn,
    catchErrors(userController.updateAccount)
);

// ADD REVIEW
router.post('/reviews/:id',
    authController.isLoggedIn,
    catchErrors(reviewController.addReview)
);

//SHOW TOP STORES
router.get('/top', catchErrors(stayController.getTopStays));

module.exports = router;