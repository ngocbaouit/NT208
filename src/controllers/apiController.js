const connection = require('../config/database');
const { createUser } = require('../models/User');
const { findUserByUsernameAndPassword } = require('../models/User');
const {generateAuthToken} = require('../models/User')
const {findUserByUsername} = require('../models/User')
const {isLogging} = require('../models/User')
const { findUserByEmail } = require('../models/User');
const {saveConfirmationCode} = require('../models/User');
const {sendConfirmationEmail,updateUserPassword,findUserByIdInConfirmationCode } = require('../models/User');
const {FavouriteTrick} = require('../models/User');
const {FavouriteFoodBreak} = require('../models/User');
const {FavouriteFoodLunch} = require('../models/User');
const {getFavouriteTrick} = require('../models/User');
const {getFavouriteFoodBreak} = require('../models/User');
const {getFavouriteFoodLunch} = require('../models/User');
const {UpdateProfile} = require('../models/User'); 
const {getUserById} = require('../models/User');
const {comparePasswords} = require('../models/User');
const {UpdatePassword} = require('../models/User');
const isValidPassword = (password) => {
    // Kiểm tra mật khẩu có đủ mạnh không (ít nhất 8 ký tự, có ký tự chữ hoa, chữ thường, và ký tự đặc biệt)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,;'@!%*?&])[A-Za-z\d.,;'@!%*?&]{8,24}$/;
    return passwordRegex.test(password);
};

const HandleRegister = async (req, res) => {
    try {
        let password = req.body.Password;
        let username = req.body.Username;
        let ConfirmPassword = req.body.RetypePassword;
        
        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Kiểm tra mật khẩu có đủ mạnh không
        if (!isValidPassword(password)) {
            return res.status(400).json({ error: 'Password must be 8-24 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character' });
        }

        // Kiểm tra xem hai mật khẩu có giống nhau không
        if (password !== ConfirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        
        // Tạo người dùng mới
        const userId = await createUser(username, password);
        const token = generateAuthToken(userId);
        // Lưu thông tin người dùng và token vào session
        req.session.user = {
            userId: userId,
            username: username,
            token: token // Giả sử API trả về token khi đăng nhập thành công
        };
        // Trả về kết quả
        res.status(200).send({ userId, token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }
}



const HandleLogin = async (req, res) => {
    try {
        let password = req.body.Password;
        let username = req.body.Username;
        
        // Kiểm tra thông tin đăng nhập 
        const user = await findUserByUsernameAndPassword(username, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }
        
        // Lưu thông tin người dùng và token vào session
        req.session.user = {
            userId: user.id,
            username: user.username,
            token: generateAuthToken(user.id) // Giả sử API trả về token khi đăng nhập thành công
        };

        // Trả về kết quả, bao gồm cả ID của người dùng và token
        res.status(200).send({ userId: user.id, token: req.session.user.token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(400).json({ error: error.message });
    }
};

const HandleForgotPassword = async (req, res) => {
    try {
        let EMAIL = req.body.Email;
        
        // Kiểm tra xem email có trong database không
        const user = await findUserByEmail(EMAIL);
        if (!user) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }
        
        // Tạo mã xác nhận (ví dụ: mã xác nhận ngẫu nhiên)
        const confirmationCode = Math.floor(100000 + Math.random() * 900000);
        
        // Lưu mã xác nhận vào database hoặc cache
        // Đảm bảo rằng bạn lưu mã xác nhận này kèm với thông tin của người dùng 
        // để kiểm tra tính hợp lệ khi người dùng nhập mã xác nhận
        await saveConfirmationCode(user.ID, confirmationCode);
        
        // Gửi mã xác nhận đến Email
        await sendConfirmationEmail(EMAIL, confirmationCode);
        
        // Phản hồi thành công
        return res.status(200).json({ message: 'Confirmation code sent to your email' });
    } catch (error) {
        console.error('Error in HandleForgotPassword:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
const HandleForgotPasswordConfirm = async (req, res) => {
    try {
        // Lấy thông tin từ request body
        let { Email, Code, NewPassword, ConfirmPassword } = req.body;
        // Kiểm tra xem email có trong bảng user không
        const user = await findUserByEmail(Email);
        if (!user) {
            console.log('Invalid email:', Email); // Xuất lỗi ra console
            return res.status(400).json({ error: 'Invalid email' });
        }
        // Kiểm tra xem hai mật khẩu có giống nhau không
        if (NewPassword !== ConfirmPassword) {
            console.log('Passwords do not match'); // Xuất lỗi ra console
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        // Kiểm tra xem user id có trong bảng ConfirmationCode không
        const confirmationCodeUser = await findUserByIdInConfirmationCode(user.ID);
        if (!confirmationCodeUser || confirmationCodeUser.code !== Code) {
            console.log('Invalid or expired confirmation code:', Code); // Xuất lỗi ra console
            return res.status(400).json({ error: 'Invalid or expired confirmation code' });
        }
        // Lưu mật khẩu mới 
        await updateUserPassword(user.ID, NewPassword);
        return res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        // Xử lý lỗi
        console.error('Error in HandleForgotPasswordConfirm:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
const HandleFavouriteTrick = async (req, res) => {
    if (req.session && (req.session.user || req.session.passport)) { 
        try {
            const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
            let trickNAME = req.body.NAME;
            let slug = req.body.SLUG;
            let image = req.body.IMAGE;
            await FavouriteTrick(userID, trickNAME, slug, image);
            
            // Phản hồi thành công
            return res.status(200).json({ message: 'Favorite trick was implemented successfully' });
        } catch (error) {
            console.error('Error in HandleFavouriteTrick:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        // Phản hồi khi người dùng chưa đăng nhập
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};
const HandleFavouriteFoodBreak = async (req, res) => {
    if (req.session && (req.session.user || req.session.passport)) { 
        try {
            const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
            let foodNAME = req.body.NAME;
            let slug = req.body.SLUG;
            let image = req.body.IMAGE;
            await FavouriteFoodBreak(userID, foodNAME, slug, image);
            
            // Phản hồi thành công
            return res.status(200).json({ message: 'Favorite foodID was implemented successfully' });
        } catch (error) {
            console.error('Error in HandleFavouriteFood:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        // Phản hồi khi người dùng chưa đăng nhập
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};
const HandleFavouriteFoodLunch = async (req, res) => {
    if (req.session && (req.session.user || req.session.passport)) { 
        try {
            const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
            let foodNAME = req.body.NAME;
            let slug = req.body.SLUG;
            let image = req.body.IMAGE;
            await FavouriteFoodLunch(userID, foodNAME, slug, image);
            
            // Phản hồi thành công
            return res.status(200).json({ message: 'Favorite foodID was implemented successfully' });
        } catch (error) {
            console.error('Error in HandleFavouriteFood:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        // Phản hồi khi người dùng chưa đăng nhập
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};
const HandleGetFavouriteTrick = async (req, res) => {
    if (req.session && (req.session.user || req.session.passport)) { 
        try {
            const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
            const favouriteTricks = await getFavouriteTrick(userID);
            return res.status(200).json(favouriteTricks);
        } catch (error) {
            console.error('Error in HandleGetFavouriteTrick:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};
const HandleGetFavouriteFoodBreak = async (req, res) => {
    if (req.session && (req.session.user || req.session.passport)) { 
        try {
            const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
            const favouriteFoodBreak = await getFavouriteFoodBreak(userID);
            return res.status(200).json(favouriteFoodBreak);
        } catch (error) {
            console.error('Error in HandleGetFavouriteFood:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};
const HandleGetFavouriteFoodLunch = async (req, res) => {
    if (req.session && (req.session.user || req.session.passport)) { 
        try {
            const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
            const favouriteFoodLunch = await getFavouriteFoodLunch(userID);
            return res.status(200).json(favouriteFoodLunch);
        } catch (error) {
            console.error('Error in HandleGetFavouriteFood:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};
const HandleUpdateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const userID = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
        await UpdateProfile(userID, name, email, phone);
        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error in HandleUpdateProfile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
const HandleUpdatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userID = req.session.user.userId; // Ensure req.session.user.userId is valid
        const user = await getUserById(userID);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isPasswordCorrect = await comparePasswords(currentPassword, user.PASSWORD);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        await UpdatePassword(userID, newPassword);

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error in HandleUpdatePassword:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
    

module.exports = {
    HandleRegister, 
    HandleLogin, 
    HandleForgotPassword, 
    HandleForgotPasswordConfirm, 
    HandleFavouriteTrick,
    HandleFavouriteFoodBreak,
    HandleFavouriteFoodLunch,
    HandleGetFavouriteTrick,
    HandleGetFavouriteFoodBreak,
    HandleGetFavouriteFoodLunch,
    HandleUpdateProfile,
    HandleUpdatePassword
}
