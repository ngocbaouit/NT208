const connection = require('../config/database');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');

const salt = bcrypt.genSaltSync(10);

connection.connect();
const generateAuthToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_KEY); // Đảm bảo bạn đã thiết lập biến môi trường JWT_KEY
  };

const createUser = (username, password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, salt, (err, hashedPassword) => { // Sử dụng salt khi hash password
            if (err) {
                reject(err);
            } else {
                const newUser = {
                    username: username,
                    password: hashedPassword
                };
                const insertUserQuery = 'INSERT INTO user SET ?';
                connection.query(insertUserQuery, newUser, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.insertId);
                    }
                });
            }
        });
    });
};

const findUserByUsernameAndPassword = (username, password) => {
    return new Promise((resolve, reject) => {
        const selectUserQuery = 'SELECT * FROM user WHERE USERNAME = ?';
        connection.query(selectUserQuery, [username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length === 0) {
                    reject({ error: 'Invalid login credentials' });
                } else {
                    const user = results[0];
                    bcrypt.compare(password, user.PASSWORD, (err, isPasswordMatch) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (isPasswordMatch) {
                                resolve({
                                    id: user.ID,
                                    username: user.USERNAME
                                });
                            } else {
                                reject({ error: 'Invalid login credentials' });
                            }
                        }
                    });
                }
            }
        });
    });
};

  const findUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const selectUserByUsernameQuery = 'SELECT * FROM user WHERE username = ?';
        connection.query(selectUserByUsernameQuery, [username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length === 0) {
                    resolve(null); // Không tìm thấy người dùng với username này
                } else {
                    resolve(results[0]); // Trả về thông tin của người dùng nếu tìm thấy
                }
            }
        });
    });
};
const isLogging = async (req) => {
    if (req.session && req.session.user &&req.session.passport.user) {
      return true;
    } else {
      return false;
    }
  }
  const findUserByEmail = (EMAIL) => {
    return new Promise((resolve, reject) => {
        const selectUserByEmail = 'SELECT * FROM user WHERE EMAIL = ?';
        connection.query(selectUserByEmail, [EMAIL], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length === 0) {
                    resolve(null); // Không tìm thấy người dùng với username này
                } else {
                    resolve(results[0]); // Trả về thông tin của người dùng nếu tìm thấy
                }
            }
        });
    });
};
const createConfirmationCodeTable = async () => {
    try {
        // Kiểm tra xem bảng ConfirmationCode đã tồn tại chưa
        const query = `
            CREATE TABLE IF NOT EXISTS ConfirmationCode (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT,
                code VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES user(ID)
            )
        `;
        
        // Thực hiện truy vấn để tạo bảng
        await new Promise((resolve, reject) => {
            connection.query(query, (err, results) => {
                if (err) {
                    console.error('Error creating ConfirmationCode table:', err);
                    reject(err);
                } else {
                    console.log('ConfirmationCode table created successfully');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('Error creating ConfirmationCode table:', error);
        throw new Error('Database error');
    }
};

const saveConfirmationCode = async (UserID, code) => {
    try {
        // Tạo bảng ConfirmationCode nếu chưa tồn tại
        await createConfirmationCodeTable();
        

        // Kiểm tra xem có mã code nào cho UserID trong 5 phút gần đây không
        const recentCode = await new Promise((resolve, reject) => {
            const query = `SELECT * FROM confirmationcode WHERE UserID = ? AND createdAt >= NOW() - INTERVAL 5 MINUTE`;
            connection.query(query, [UserID], (err, results) => {
                if (err) {
                    console.error('Error in saveConfirmationCode:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // Nếu có mã code gần đây, xóa nó
        if (recentCode.length > 0) {
            await new Promise((resolve, reject) => {
                const deleteQuery = `DELETE FROM confirmationcode WHERE UserID = ?`;
                connection.query(deleteQuery, [UserID], (deleteErr, deleteResults) => {
                    if (deleteErr) {
                        console.error('Error deleting recent confirmation code:', deleteErr);
                        reject(deleteErr);
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Lưu mã code mới vào bảng
        await new Promise((resolve, reject) => {
            const insertQuery = `INSERT INTO confirmationCode (UserID, code, createdAt) VALUES (?, ?, NOW())`;
            connection.query(insertQuery, [UserID, code], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Error saving confirmation code:', insertErr);
                    reject(insertErr);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('Error in saveConfirmationCode:', error);
        throw new Error('Database update error');
    }
};
const sendConfirmationEmail = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            // Cấu hình transport để gửi email
            service: 'gmail',
            auth: {
                user: '22521546@gm.uit.edu.vn',
                pass: '1162348797'
            }
        });

        const mailOptions = {
            from: '22521546@gm.uit.edu.vn',
            to: email,
            subject: 'Confirmation Code for Password Reset',
            text: `Your confirmation code is: ${code}`
        };

        // Gửi email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error in sendConfirmationEmail:', error);
        throw new Error('Email sending error');
    }
};
const updateUserPassword = (userId, newPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(newPassword, salt, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const updatePasswordQuery = 'UPDATE user SET password = ? WHERE id = ?';
                connection.query(updatePasswordQuery, [hashedPassword, userId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.affectedRows);
                    }
                });
            }
        });
    });
};
const findUserByIdInConfirmationCode = (UserID) => {
    return new Promise((resolve, reject) => {
        const selectUserByUserID = 'SELECT * FROM confirmationcode WHERE UserID = ?';
        connection.query(selectUserByUserID, [UserID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length === 0) {
                    resolve(null); // Không tìm thấy người dùng với username này
                } else {
                    resolve(results[0]); // Trả về thông tin của người dùng nếu tìm thấy
                }
            }
        });
    });
}
const FavouriteTrick = (ID_USER, NAME, SLUG, IMAGE) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra trick đã tồn tại trong yêu thích hay chưa
        const existQuery = "SELECT * FROM yeu_thich_meo WHERE ID_USER = ? AND NAME = ? AND SLUG = ? AND IMAGE = ?";
        connection.query(existQuery, [ID_USER, NAME, SLUG, IMAGE], (existErr, existResults) => {
            if (existErr) {
                return reject(existErr); 
            }
            // Nếu trick đã tồn tại, xóa nó ra khỏi yêu thích
            if (existResults.length > 0) {
                const deleteQuery = "DELETE FROM yeu_thich_meo WHERE ID_USER = ? AND NAME = ? AND SLUG = ? AND IMAGE = ?";
                connection.query(deleteQuery, [ID_USER, NAME, SLUG, IMAGE], (deleteErr, deleteResults) => {
                    if (deleteErr) {
                        return reject(deleteErr);
                    }
                    resolve({ result: deleteResults });
                });
            } else {
                // Nếu trick chưa tồn tại, thêm vào yêu thích
                const insertQuery = "INSERT INTO yeu_thich_meo (ID_USER, NAME, SLUG, IMAGE) VALUES (?, ?, ?, ?)";
                connection.query(insertQuery, [ID_USER, NAME, SLUG, IMAGE], (insertErr, insertResults) => {
                    if (insertErr) {
                        return reject(insertErr);
                    }
                    resolve({ result: insertResults });
                });
            }
        });
    });
};
const FavouriteFoodBreak = (ID_USER, NAME, SLUG, IMAGE) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra món ăn đã tồn tại trong yêu thích hay chưa
        const existQuery = "SELECT * FROM yeu_thich_mon_an_buoi_sang WHERE ID_USER = ? AND NAME = ? AND SLUG = ? AND IMAGE = ?";
        connection.query(existQuery, [ID_USER, NAME, SLUG, IMAGE], (existErr, existResults) => {
            if (existErr) {
                return reject(existErr); 
            }
            // Nếu món ăn đã tồn tại, xóa nó ra khỏi yêu thích
            if (existResults.length > 0) {
                const deleteQuery = "DELETE FROM yeu_thich_mon_an_buoi_sang WHERE ID_USER = ? AND NAME = ? AND SLUG = ? AND IMAGE = ?";
                connection.query(deleteQuery, [ID_USER, NAME, SLUG, IMAGE], (deleteErr, deleteResults) => {
                    if (deleteErr) {
                        return reject(deleteErr);
                    }
                    resolve({ result: deleteResults });
                });
            } else {
                // Nếu món ăn chưa tồn tại, thêm vào yêu thích
                const insertQuery = "INSERT INTO yeu_thich_mon_an_buoi_sang (ID_USER, NAME, SLUG, IMAGE) VALUES (?, ?, ?, ?)";
                connection.query(insertQuery, [ID_USER, NAME, SLUG, IMAGE], (insertErr, insertResults) => {
                    if (insertErr) {
                        return reject(insertErr);
                    }
                    resolve({ result: insertResults });
                });
            }
        });
    });
};
const FavouriteFoodLunch = (ID_USER, NAME, SLUG, IMAGE) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra món ăn đã tồn tại trong yêu thích hay chưa
        const existQuery = "SELECT * FROM yeu_thich_mon_an_buoi_trua WHERE ID_USER = ? AND NAME = ? AND SLUG = ? AND IMAGE = ?";
        connection.query(existQuery, [ID_USER, NAME, SLUG, IMAGE], (existErr, existResults) => {
            if (existErr) {
                return reject(existErr); 
            }
            // Nếu món ăn đã tồn tại, xóa nó ra khỏi yêu thích
            if (existResults.length > 0) {
                const deleteQuery = "DELETE FROM yeu_thich_mon_an_buoi_trua WHERE ID_USER = ? AND NAME = ? AND SLUG = ? AND IMAGE = ?";
                connection.query(deleteQuery, [ID_USER, NAME, SLUG, IMAGE], (deleteErr, deleteResults) => {
                    if (deleteErr) {
                        return reject(deleteErr);
                    }
                    resolve({ result: deleteResults });
                });
            } else {
                // Nếu món ăn chưa tồn tại, thêm vào yêu thích
                const insertQuery = "INSERT INTO yeu_thich_mon_an_buoi_trua (ID_USER, NAME, SLUG, IMAGE) VALUES (?, ?, ?, ?)";
                connection.query(insertQuery, [ID_USER, NAME, SLUG, IMAGE], (insertErr, insertResults) => {
                    if (insertErr) {
                        return reject(insertErr);
                    }
                    resolve({ result: insertResults });
                });
            }
        });
    });
};
const getFavouriteTrick = (ID_USER) => {
    return new Promise((resolve, reject) => {
        const selectQuery = "SELECT * FROM yeu_thich_meo WHERE ID_USER = ?";
        connection.query(selectQuery, [ID_USER], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
const getFavouriteFoodBreak = (ID_USER) => {
    return new Promise((resolve, reject) => {
        const selectQuery = "SELECT * FROM yeu_thich_mon_an_buoi_sang WHERE ID_USER = ?";
        connection.query(selectQuery, [ID_USER], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
const getFavouriteFoodLunch = (ID_USER) => {
    return new Promise((resolve, reject) => {
        const selectQuery = "SELECT * FROM yeu_thich_mon_an_buoi_trua WHERE ID_USER = ?";
        connection.query(selectQuery, [ID_USER], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
const UpdateProfile = async (userId, name, email, phone) => {
    return new Promise((resolve, reject) => {
        try {
            const query = 'UPDATE user SET NAME = ?, EMAIL = ?, SDT = ? WHERE ID = ?';
            const values = [name, email, phone, userId];

            connection.query(query, values, (err, result) => {
                if (err) {
                    return reject(err); 
                }
                resolve(result); 
            });
        } catch (error) {
            reject(error); 
        }
    });
};

const comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
const updatePassword = async (userId, newPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(newPassword, salt, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const query = 'UPDATE user SET PASSWORD = ? WHERE ID = ?';
                connection.query(query, [hashedPassword, userId], (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            }
        });
    });
};
const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const selectUserByIdQuery = 'SELECT * FROM user WHERE ID = ?';
        connection.query(selectUserByIdQuery, [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length === 0) {
                    resolve(null); 
                } else {
                    resolve(results[0]); 
                }
            }
        });
    });
};
const UpdatePassword = async (userId, newPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(newPassword, salt, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const query = 'UPDATE user SET PASSWORD = ? WHERE ID = ?';
                connection.query(query, [hashedPassword, userId], (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            }
        });
    });
};
module.exports = {
    createUser,
    findUserByUsernameAndPassword,
    generateAuthToken,
    findUserByUsername,
    isLogging,
    findUserByEmail,saveConfirmationCode,sendConfirmationEmail,findUserByIdInConfirmationCode,
    updateUserPassword,
    FavouriteTrick,
    FavouriteFoodBreak,
    FavouriteFoodLunch,
    getFavouriteTrick,
    getFavouriteFoodBreak,
    getFavouriteFoodLunch,
    UpdateProfile,
    comparePasswords,
    getUserById,
    UpdatePassword
};
