require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const configViewEngine = require('./config/viewEngine');
const webRouters = require('./routes/web');
const apiRouters = require('./routes/api');
const authRouters = require('./routes/auth');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8888;
const HOST_NAME = process.env.HOST_NAME;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình express-session
app.use(session({
    secret: process.env.SESSION_SECRET, // Chuỗi bí mật để ký và mã hóa cookie, có thể thay đổi
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

configViewEngine(app);

// Routers
app.use('/', webRouters);
app.use('/', authRouters);
app.use('/v1', apiRouters);

function runPythonScript() {
    const activateCommand = 'conda activate recipe && ';
    const scriptPath = 'D:\\Web-NT208\\generator\\Recipe-Generation-from-Food-Image\\run.py';
    const command = `${activateCommand}python ${scriptPath}`;

    const process = exec(command);

    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    process.stderr.on('data', (err) => {
        console.error(err.toString());
    });

    process.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
        }
    });
}

runPythonScript();

function runNodeScript() {
    const command = "D: && cd D:\\Web-NT208\\generator\\Calorie-Calculator && npm run dev";

    const process = exec(command);

    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    process.stderr.on('data', (err) => {
        console.error(err.toString());
    });

    process.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Node script exited with code ${code}`);
        }
    });
}

runNodeScript();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
