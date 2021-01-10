const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');
const mongoose = require('mongoose');
const Stay = mongoose.model('Stay');
const User = mongoose.model('User');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true); //1st value is provided in case of error.
        } else {
            next({ message: 'That filetype isn\'t allowed'}, false);
        }
    }
};

exports.homePage = (req, res) => {
    //req.flash('error', `hola <strong>que</strong> tal`);
    //req.flash('info', `hola`);
    //req.flash('warning', `hola`);
    //req.flash('success', `hola`);

    res.render('extendingLayout');
};

exports.addStay = (req, res) => {
    //same template is used to create and to edit
    res.render('editStay', { title: 'Add Stay' });
};

//MIDLEWARE FUNCTION for CREATE STAY
exports.verify = multer(multerOptions).single('photo');

//MIDLEWARE FUNCTION for CREATE STAY
exports.upload = async (req, res, next) => {
    //check if there is no new file to resize
    if (!req.file) {
        next(); // no file -> do nothing and go to next middleware
        return;
    }
    console.log(req.body);
    console.log(req.file);
   
    const extension = req.file.mimetype.split('/')[1];

    req.body.photo = `${uuid.v4()}.${extension}`;
   
    //now we resize and write in hard-drive
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO); //width=800, height=AUTO
    await photo.write(`./public/uploads/${req.body.photo}`);
   
    //photo saved in file system, keep going with the PIPELINE
    next();
};

exports.createStay = async (req, res) => {
    req.body.author = req.user._id;
    const stay = new Stay(req.body);
    const savedStay = await stay.save();
    console.log('Stay saved!');

    req.flash('success', `Successfully Created ${stay.name}.`);

    res.redirect(`/stay/${savedStay.slug}`);
};

exports.getStayBySlug = async (req, res, next) => {
    const stay = await Stay.findOne({ slug: req.params.slug });

    // If no stay -> DB send a NULL -> do nothing and follow the pipeline
    if (!stay) {
        next();
        return;
    }

    res.render('stay', { title: `Stay ${stay.name}`, stay: stay });
};
//User.findOne({ _id: stay.author})
exports.getStays = async (req, res) => {
    const page = req.params.page || 1;
    const limit = 6; // items in each page
    const skip = (page * limit) - limit;

    //1. query the DB for a list of all stays
    const staysPromise = Stay
        .find() //look for ALL
        .skip(skip) //Skip items of former pages
        .limit(limit) //Take the desired number of items
        .sort({ created: 'desc'}); //sort them

    const countPromise = Stay.count();

    //send two promises (2 queries) at the same time
    const [stays, count] = await Promise.all([staysPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    if (!stays.length && skip) {
        req.flash('info', `You asked for page ${page}. But that does not exist. So
        I put you on page ${pages}`);
        res.redirect(`/stays/page/${pages}`);
        return;
    }

    res.render('stays', {title: 'Stays', stays: stays, page: page, pages: pages, count: count});
};

exports.editStay = async (req, res) => {
    const stay = await Stay.findOne({ _id: req.params.id });
    confirmOwner(stay, req.user);
    res.render('editStay', { title: `Edit ${stay.name}`, stay: stay});
};

exports.updateStay = async (req, res) => {
    // find and update the stay
    const stay = await Stay.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, //return new stay instead of old one
        runValidators: true
    }).exec();

    req.flash('success', `Successfully updated <strong>${stay.name}</strong>.
    <a href="/stay/${stay.slug}">View stay</a> `);
    res.redirect(`/stays/${stay._id}/edit`);
};

exports.searchStays = async (req, res) => {
    const stays = await Stay.find({
        $text: { //1er param: query filter
            $search: req.query.q
        }
    }, { //2n param: query projection
        score: { $meta: 'textScore'}
    }).sort({ //first filter
        score: { $meta: 'textScore'}
    }).limit(5); //second filter
    
    res.json({stays, length: stays.length});
};

exports.getStaysByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true};

    //Promise1: AGGREGATE operation
    const tagsPromise = Stay.getTagsList();

    //Promise2: find all the stays where the tag property
    //of a stay includes the tag passed by (or any tag)
    const staysPromise = Stay.find({ tags: tagQuery });

    const [tags, stays] = await Promise.all([tagsPromise, staysPromise]);
   
    res.render('tags', { title: 'Tags', tags: tags, stays: stays, tag: tag});
};

//*** Verify Credentials
const confirmOwner = (stay, user) => {
    if (!stay.author.equals(user._id)) {
    throw Error('You must own the stay in order to edit it');
    }
};

exports.getTopStays = async (req, res) => {
    const stays = await Stay.getTopStays();
    res.render('topStays', { stays, title: 'Top Stays'});
};