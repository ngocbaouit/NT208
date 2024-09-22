const express = require('express');
const router = express.Router();
const {HandleRegister} = require('../controllers/apiController');
const {HandleLogin} = require('../controllers/apiController');
const {HandleForgotPassword} = require('../controllers/apiController');
const {HandleForgotPasswordConfirm} = require('../controllers/apiController');
const {HandleFavouriteTrick} = require('../controllers/apiController');
const {HandleFavouriteFoodBreak} = require('../controllers/apiController');
const {HandleFavouriteFoodLunch} = require('../controllers/apiController');
const {HandleGetFavouriteTrick} = require('../controllers/apiController');
const {HandleGetFavouriteFoodBreak} = require('../controllers/apiController');
const {HandleGetFavouriteFoodLunch} = require('../controllers/apiController');
const {HandleUpdateProfile}  = require('../controllers/apiController');
const {HandleUpdatePassword} = require('../controllers/apiController');

router.post('/Login',HandleLogin);
router.post('/Register',HandleRegister);
router.post('/ForgotPassword',HandleForgotPassword);
router.post('/ForgotPassword/Confirm',HandleForgotPasswordConfirm);
router.post('/FavouriteTrick',HandleFavouriteTrick);
router.post('/FavouriteFoodBreak',HandleFavouriteFoodBreak);
router.post('/FavouriteFoodLunch',HandleFavouriteFoodLunch);
router.get('/GetFavouriteTrick',HandleGetFavouriteTrick);
router.get('/GetFavouriteFoodBreak',HandleGetFavouriteFoodBreak);
router.get('/GetFavouriteFoodLunch',HandleGetFavouriteFoodLunch);
router.post('/UpdateProfile',HandleUpdateProfile);
router.post('/UpdatePassword',HandleUpdatePassword);

module.exports = router; 
