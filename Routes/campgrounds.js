const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {campgroundSchema, reviewSchema} = require('../schemas')
const flash = require('connect-flash');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');



router.get('/', catchAsync(async (req, res, next)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', isLoggedIn,(req, res)=>{
    
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn , validateCampground, catchAsync(async (req, res, next) =>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success','successfully made campground');
    res.redirect(`/campgrounds/${campground._id}`)
    
}))

router.get('/:id', catchAsync(async (req, res, next)=>{
    const {id} = req.params.id;
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    
    // console.log(campground);
    if(!campground){
        req.flash('error','cannot find campground!');
        return res.redirect('/campgrounds')
    }
   
    res.render('campgrounds/show', {campground})
}))

router.get('/:id/edit',isAuthor, isLoggedIn,catchAsync(async (req, res, next)=>{
    const {id} = req.params.id;
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    
    // console.log(campground);
    if(!campground){
        req.flash('error','cannot find campground!');
        return res.redirect('/campgrounds')
    }
    //const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

router.put('/:id',isAuthor, isLoggedIn,validateCampground, catchAsync(async (req, res, next)=>{
    const { id } = req.params;
    
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success','successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id',isAuthor, isLoggedIn, catchAsync(async (req, res, next)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','successfully deleted review')

    res.redirect('/campgrounds')
}))

module.exports = router;