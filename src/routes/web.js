const express = require('express');
const { getHomepage } = require('../controllers/homeController');
const { getLogin } = require('../controllers/homeController');
const { getRegister } = require('../controllers/homeController');
const { getProfile } = require('../controllers/homeController');
const { getMeoVat } = require('../controllers/homeController');
const { getBuaSang } = require('../controllers/homeController');
const { getBuaTrua } = require('../controllers/homeController');
const { getLogout } = require('../controllers/homeController');
const { getForgotPassword } = require('../controllers/homeController');
const { getMeo } = require('../controllers/homeController');
const { getMonansang } = require('../controllers/homeController');
const { getMonantrua } = require('../controllers/homeController');
const { getSearch } = require('../controllers/homeController');
const { getMonancreate } = require('../controllers/homeController');
const { postMonan }= require('../controllers/homeController');


const route = require('color-convert/route');
const router = express.Router();

router.get('/',getHomepage);

router.get('/Login', getLogin);


router.get('/Register', getRegister);


router.get('/Logout', getLogout);

router.get('/ForgotPassword', getForgotPassword);
router.get('/Profile', getProfile);

// Trang meo
router.get('/MeoVat', getMeoVat);
router.get('/MeoVat/:SLUG', getMeo);
router.get('/MeoVat/navigate/:page', getMeoVat);

// Trang mon an
router.get('/BuaSang', getBuaSang);
router.get('/BuaTrua', getBuaTrua);
router.get('/BuaSang/create', getMonancreate);
router.post('/BuaSang/store',postMonan);
router.get('/BuaSang/:SLUG', getMonansang);
router.get('/BuaTrua/:SLUG', getMonantrua);
router.get('/BuaSang/navigate/:page', getBuaSang);
router.get('/BuaTrua/navigate/:page', getBuaTrua);
router.get('/search', getSearch);

module.exports = router; 