const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const connection = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateAuthToken } = require('../models/User');
require('dotenv').config();

// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    } else {
        console.log('Connected to database');
    }
});

// Cấu hình GoogleStrategy cho Passport
passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile', 'email']
}, function verify(issuer, profile, cb) {
    connection.query('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
        issuer,
        profile.id
    ], function (err, rows) {
        if (err) {
            console.error('Error querying federated_credentials:', err);
            return cb(err);
        }
        if (!rows.length) {
            const username = profile.emails[0].value || 'default_username';
            const email = profile.emails[0].value;
            const password = generateRandomPassword(); // Thay thế generateRandomPassword() bằng hàm tạo mật khẩu ngẫu nhiên của bạn
            connection.query('INSERT INTO user (NAME, USERNAME, EMAIL, PASSWORD) VALUES (?, ?, ?, ?)', [
                profile.displayName,
                username,
                email,
                password
            ], function (err, result) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return cb(err);
                }

                const id = result.insertId;
                connection.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
                    id,
                    issuer,
                    profile.id
                ], function (err) {
                    if (err) {
                        console.error('Error inserting federated_credentials:', err);
                        return cb(err);
                    }
                    const user = {
                        userId: id,
                        name: profile.displayName,
                        username: username,
                        email: email
                    };
                    console.log('Created new user:', user);
                    // Truyền thông tin người dùng vào session
                    return cb(null, { userId: user.userId, username: user.username, email: user.email, token: generateAuthToken(user.userId) });
                });
            });
        } else {
            const userId = rows[0].user_id;
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], function (err, userRows) {
                if (err) {
                    console.error('Error querying user:', err);
                    return cb(err);
                }
                if (!userRows.length) {
                    return cb(null, false);
                }
                const user = {
                    userId: userRows[0].ID,
                    username: userRows[0].USERNAME,
                    email: userRows[0].EMAIL
                };
                // Truyền thông tin người dùng vào session
                return cb(null, { userId: user.userId, username: user.username, email: user.email, token: generateAuthToken(user.userId) });
            });
        }
    });
}));

// Serialize và Deserialize user
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

// Hàm tạo mật khẩu ngẫu nhiên và băm
function generateRandomPassword() {
    const randomPassword = crypto.randomBytes(10).toString('hex');
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(randomPassword, salt);
    return hashedPassword;
}

// Cấu hình các route cho đăng nhập và callback từ Google
router.get('/login/federated/google', passport.authenticate('google'));
router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = router;
