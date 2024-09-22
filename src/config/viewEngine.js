const path = require('path');
const express = require('express');
const handlebars=require('express-handlebars');

 //const app=express()
const configViewEngine = (app) => {
    //const app=express()
    app.set('views', path.join('./src','views'))
    app.set('view engine', 'ejs')
    app.engine('handlebars', handlebars.engine())
    app.set('view engine','handlebars')

    //config static files: image/css/js
    app.use(express.static(path.join('./src', 'public')))
}

module.exports = configViewEngine;