const { session } = require('passport');
const connection = require('../config/database');
connection.connect();

const getHomepage = async (req, res) => {
  const loggedIn = req.session && (req.session.user || req.session.passport);
  if (loggedIn) {
    const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;

    try {
      // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
      connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
        if (err) {
          console.error('Lỗi khi thực hiện truy vấn:', error);
          res.status(500).send('Lỗi Server Nội bộ');
          return;
        }

        let username = null;
        if (rows.length > 0 && rows[0].NAME) {
          username = rows[0].USERNAME;
        } else if (req.session.user) {
          username = req.session.user.username;
        } else {
          username = req.session.passport.user.username;
        }

        // Sau khi nhận được kết quả từ truy vấn, render trang
        res.render('Homepage.ejs', { loggedIn: true, username: username });
      });
    } catch (error) {
      console.error('Lỗi khi thực hiện truy vấn:', error);
      res.status(500).send('Lỗi Server Nội bộ');
    }
  } else {
    res.render('Homepage.ejs', { loggedIn: false, username: null });
  }
}
const getLogin = (req, res) => {
  res.render('Login.ejs');
}
const getRegister = (req, res) => {
  res.render('SignUp.ejs');
}
const getForgotPassword = (req, res) => {
  res.render('Forgotpassword.ejs')
}
const getMeoVat = (req, res, next) => {
  const currentTitle = 'Mẹo Vặt';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  let page = parseInt(req.params.page);
  let limit = 9;
  let offset = (!page || page < 1) ? 0 : (page - 1) * limit;
  let user = [];
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL database!');
    //Thực hiện truy vấn sau khi kết nối đã thành công
    connection.query(
      `SELECT * From meo LIMIT ${limit} OFFSET ${offset}`,
      function (err, result, fields) {
        user = result;
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return;
        }
        //res.render('meovat.handlebars',{user})
        if (loggedIn) {
          const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
          try {
            // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
              if (err) {
                console.error('Lỗi khi thực hiện truy vấn:', error);
                res.status(500).send('Lỗi Server Nội bộ');
                return;
              }

              let username = null;
              if (rows.length > 0 && rows[0].NAME) {
                username = rows[0].USERNAME;
              } else if (req.session.user) {
                username = req.session.user.username;
              } else {
                username = req.session.passport.user.username;
              }

              // Sau khi nhận được kết quả từ truy vấn, render trang
              res.render('meovat.handlebars', { user, loggedIn: true, username: username, currentTitle });
            });
          } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).send('Lỗi Server Nội bộ');
          }
        } else {
          res.render('meovat.handlebars', { user, loggedIn: false, username: null, currentTitle });
        }
      }
    );
  })

}
const getMeo = (req, res, next) => {
  const link = '/MeoVat';
  const currentTitle = 'Mẹo Vặt';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  const slug = req.params.SLUG;
  let user = [];
  let img = [];
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database' + err.stack)
      return;
    }
    console.log('Connect to database succesfully!');
    connection.query(
      'SELECT * from chi_tiet_meo Where SLUG=?', [slug],
      function (err, result, fields) {
        let id = result.ID;
        'SELECT * from image_ctmeo where ID_CTMEO=?', [id],
          function (err, result, fields) {
            img = result;
          }
        user = result;
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return;
        }
        if (loggedIn) {
          const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
          try {
            // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
              if (err) {
                console.error('Lỗi khi thực hiện truy vấn:', error);
                res.status(500).send('Lỗi Server Nội bộ');
                return;
              }

              let username = null;
              if (rows.length > 0 && rows[0].NAME) {
                username = rows[0].USERNAME;
              } else if (req.session.user) {
                username = req.session.user.username;
              } else {
                username = req.session.passport.user.username;
              }

              // Sau khi nhận được kết quả từ truy vấn, render trang
              res.render('chitietmeo.handlebars', { user, loggedIn: true, username: username, currentTitle, link });
            });
          } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).send('Lỗi Server Nội bộ');
          }
        } else {
          res.render('chitietmeo.handlebars', { user, loggedIn: false, username: null, currentTitle, link });
        }
      }
    );
  })
}

const getMonancreate = (req, res, next) => {
  const loggedIn = req.session && (req.session.user || req.session.passport);
  const link = '/BuaSang/create';
  const currentTitle = 'Bữa sáng';
  if (loggedIn) {
    const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
    try {
      // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
      connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
        if (err) {
          console.error('Lỗi khi thực hiện truy vấn:', error);
          res.status(500).send('Lỗi Server Nội bộ');
          return;
        }

        let username = null;
        if (rows.length > 0 && rows[0].NAME) {
          username = rows[0].USERNAME;
        } else if (req.session.user) {
          username = req.session.user.username;
        } else {
          username = req.session.passport.user.username;
        }

        // Sau khi nhận được kết quả từ truy vấn, render trang
        res.render('create.handlebars', { loggedIn: true, username: username, currentTitle, link });
      });
    } catch (error) {
      console.error('Lỗi khi thực hiện truy vấn:', error);
      res.status(500).send('Lỗi Server Nội bộ');
    }
  } else {
    res.render('create.handlebars', { loggedIn: false, username: null, currentTitle, link });
  }
}


const postMonan = (req, res, next) => {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err.stack);
      return res.status(500).json({ error: 'Database connection error' });
    }
    console.log('Connected to database successfully');
    const table = req.body.list;
    const sql = `INSERT INTO ${table} SET  NAME= ?, INTRODUCE=?, IMAGE=?, SLUG=?, IMAGE1=?, IMAGE2=?, IMAGE3=?, nguyenlieu=?, cachlam=?, baoquan=?`;
    const values = [req.body.NAME, req.body.INTRODUCE, req.body.IMAGE, req.body.SLUG, req.body.IMAGE1, req.body.IMAGE2, req.body.IMAGE3, req.body.nguyenlieu, req.body.cachlam, req.body.baoquan];
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Failed to insert data' });
      }
      const user = req.body;
      const loggedIn = req.session && (req.session.user || req.session.passport);
      if (loggedIn) {
        const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
    
        try {
          // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
          connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
            if (err) {
              console.error('Lỗi khi thực hiện truy vấn:', error);
              res.status(500).send('Lỗi Server Nội bộ');
              return;
            }
    
            let username = null;
            if (rows.length > 0 && rows[0].NAME) {
              username = rows[0].USERNAME;
            } else if (req.session.user) {
              username = req.session.user.username;
            } else {
              username = req.session.passport.user.username;
            }
    
            // Sau khi nhận được kết quả từ truy vấn, render trang
            res.render('Homepage.ejs', { loggedIn: true, username: username });
          });
        } catch (error) {
          console.error('Lỗi khi thực hiện truy vấn:', error);
          res.status(500).send('Lỗi Server Nội bộ');
        }
      } else {
        res.render('Homepage.ejs', { loggedIn: false, username: null });
      }


    });
  });
};
const getProfile = (req, res) => {
  const currentTitle = 'Trang Cá Nhân';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  if (loggedIn) {
    const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
    const username = req.session.user ? req.session.user.username : req.session.passport.user.username;
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
      }
      console.log('Connect to database successfully!');

      let userData = {};
      let userFavouriteMeo = [];
      let userFavouriteMonAnBuoiSang = [];
      let userFavouriteMonAnBuoiTrua = [];
      let loveCount = 0;

      connection.query('SELECT * FROM user WHERE USERNAME = ?', [username], (err, result) => {
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return;
        }

        userData = result;
        connection.query('SELECT * FROM yeu_thich_meo WHERE ID_USER = ?', [userId], (err, result) => {
          if (err) {
            console.error('Error executing query: ' + err.stack);
            return;
          }
          userFavouriteMeo = result;
          loveCount += result.length;

          connection.query('SELECT * FROM yeu_thich_mon_an_buoi_sang WHERE ID_USER = ?', [userId], (err, result) => {
            if (err) {
              console.error('Error executing query: ' + err.stack);
              return;
            }
            userFavouriteMonAnBuoiSang = result;
            loveCount += result.length;

            connection.query('SELECT * FROM yeu_thich_mon_an_buoi_trua WHERE ID_USER = ?', [userId], (err, result) => {
              if (err) {
                console.error('Error executing query: ' + err.stack);
                return;
              }
              userFavouriteMonAnBuoiTrua = result;
              loveCount += result.length;
              if (loggedIn) {
                res.render('Userpage.handlebars', {
                  userData,
                  userFavouriteMeo,
                  userFavouriteMonAnBuoiSang,
                  userFavouriteMonAnBuoiTrua,
                  loggedIn: true,
                  username,
                  currentTitle,
                  love: loveCount
                });
              } else {
                res.render('Userpage.handlebars', {
                  userData,
                  userFavouriteMeo,
                  userFavouriteMonAnBuoiSang,
                  userFavouriteMonAnBuoiTrua,
                  loggedIn: false,
                  username: null,
                  currentTitle,
                  love: 0
                });
              }
            });
          });
        });
      });
    });
  } else {
    res.render('Userpage.handlebars', {
      userData: {},
      userFavouriteMeo: [],
      userFavouriteMonAnBuoiSang: [],
      userFavouriteMonAnBuoiTrua: [],
      loggedIn: false,
      username: null,
      currentTitle,
      love: 0
    });
  }
};

const getBuaSang = (req, res) => {
  const currentTitle = 'Món Ăn Sáng';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  let page = parseInt(req.params.page);
  let user = [];
  let img = [];
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database' + err.stack)
      return;
    }
    console.log('Connect to database succesfully!');
    const limit = 6;
    //const offset=1;
    const offset = (!page || page <= 1) ? 0 : (page - 1) * 6;
    connection.query(
      `SELECT * from bua_sang LIMIT ${limit} OFFSET ${offset}`,
      function (err, result, fields) {
        user = result;
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return;
        }
        console.log(">>>result= ", page);
        if (loggedIn) {
          const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
          try {
            // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
              if (err) {
                console.error('Lỗi khi thực hiện truy vấn:', error);
                res.status(500).send('Lỗi Server Nội bộ');
                return;
              }

              let username = null;
              if (rows.length > 0 && rows[0].NAME) {
                username = rows[0].USERNAME;
              } else if (req.session.user) {
                username = req.session.user.username;
              } else {
                username = req.session.passport.user.username;
              }

              // Sau khi nhận được kết quả từ truy vấn, render trang
              res.render('buasang.handlebars', { user, loggedIn: true, username: username, currentTitle });
            });
          } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).send('Lỗi Server Nội bộ');
          }
        } else {
          res.render('buasang.handlebars', { user, loggedIn: false, username: null, currentTitle });
        }
      }
    );
  })
}
const getMonansang = (req, res, next) => {
  const link = '/BuaSang';
  const currentTitle = 'Món Ăn Sáng';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  const slug = req.params.SLUG;
  let user = [];
  let img = [];
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database' + err.stack)
      return;
    }
    console.log('Connect to database succesfully!');
    connection.query(
      'SELECT * from bua_sang Where SLUG=?', [slug],
      function (err, result, fields) {
        let id = result.ID;
        'SELECT * from image_ctmeo where ID_CTMEO=?', [id],
          function (err, result, fields) {
            img = result;
          }
        user = result;
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return;
        }
        if (loggedIn) {
          const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
          try {
            // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
              if (err) {
                console.error('Lỗi khi thực hiện truy vấn:', error);
                res.status(500).send('Lỗi Server Nội bộ');
                return;
              }

              let username = null;
              if (rows.length > 0 && rows[0].NAME) {
                username = rows[0].USERNAME;
              } else if (req.session.user) {
                username = req.session.user.username;
              } else {
                username = req.session.passport.user.username;
              }

              // Sau khi nhận được kết quả từ truy vấn, render trang
              res.render('chitietmonan.handlebars', { user, loggedIn: true, username: username, currentTitle, link });
            });
          } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).send('Lỗi Server Nội bộ');
          }
        } else {
          res.render('chitietmonan.handlebars', { user, loggedIn: false, username: null, currentTitle, link });
        }
      }
    );
  })
}
const getBuaTrua = (req, res) => {
  const currentTitle = 'Món Ăn Trưa';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  let page = parseInt(req.params.page);
  let user = [];
  let img = [];
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database' + err.stack)
      return;
    }
    console.log('Connect to database succesfully!');
    let limit = 6;
    let offset = (!page || page < 1) ? 0 : (page - 1) * 6
    connection.query(
      `SELECT * from bua_trua LIMIT ${limit} OFFSET ${offset}`,
      function (err, result, fields) {
        user = result;
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return;
        }
        if (loggedIn) {
          const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
          try {
            // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
              if (err) {
                console.error('Lỗi khi thực hiện truy vấn:', error);
                res.status(500).send('Lỗi Server Nội bộ');
                return;
              }

              let username = null;
              if (rows.length > 0 && rows[0].NAME) {
                username = rows[0].USERNAME;
              } else if (req.session.user) {
                username = req.session.user.username;
              } else {
                username = req.session.passport.user.username;
              }

              // Sau khi nhận được kết quả từ truy vấn, render trang
              res.render('buatrua.handlebars', { user, loggedIn: true, username: username, currentTitle });
            });
          } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).send('Lỗi Server Nội bộ');
          }
        } else {
          res.render('buatrua.handlebars', { user, loggedIn: false, username: null, currentTitle });
        }
      }
    );
  })
}

const getMonantrua = (req, res) => {
  const link = '/BuaTrua';
  const currentTitle = 'Món Ăn Trưa';
  const loggedIn = req.session && (req.session.user || req.session.passport);
  const slug = req.params.SLUG;
  let user = [];
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database' + err.stack)
      return;
    }
    console.log('Connect to database succesfully!');
    connection.query(
      'SELECT * from bua_trua Where SLUG=?', [slug],
      function (err, result, fields) {
        user = result;
        if (loggedIn) {
          const userId = req.session.user ? req.session.user.userId : req.session.passport.user.userId;
          try {
            // Truy vấn để lấy tên người dùng từ cơ sở dữ liệu
            connection.query('SELECT * FROM user WHERE ID = ?', [userId], (err, rows) => {
              if (err) {
                console.error('Lỗi khi thực hiện truy vấn:', error);
                res.status(500).send('Lỗi Server Nội bộ');
                return;
              }

              let username = null;
              if (rows.length > 0 && rows[0].NAME) {
                username = rows[0].USERNAME;
              } else if (req.session.user) {
                username = req.session.user.username;
              } else {
                username = req.session.passport.user.username;
              }

              // Sau khi nhận được kết quả từ truy vấn, render trang
              res.render('chitietmonan.handlebars', { user, loggedIn: true, username: username, currentTitle, link });
            });
          } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).send('Lỗi Server Nội bộ');
          }
        } else {
          res.render('chitietmonan.handlebars', { user, loggedIn: false, username: null, currentTitle, link });
        }
      }
    );
  })

}
const getLogout = async (req, res) => {
  try {
    console.log(req.session)
    // Kiểm tra đăng nhập
    if (!req.session && !req.session.user && !req.session.passport) {
      return res.status(400).send({ message: "You are not logged in." });
    }

    // Đăng xuất bằng cách hủy session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send({ error: "Error logging out" });
      }
      res.redirect('/');
    });
  } catch (error) {
    return res.status(500).send({ error: "Server Error" });
  }
};

const getSearch = (request, response) => {

  const query = request.query.q;


  connection.query(`SELECT NAME, INTRODUCE, LINK, IMAGE FROM meo WHERE meo.NAME LIKE '%${query}%'
  UNION ALL
  SELECT NAME, INTRODUCE, LINK, IMAGE FROM bua_sang WHERE bua_sang.NAME LIKE '%${query}%'
  UNION ALL
  SELECT NAME, INTRODUCE, LINK, IMAGE FROM bua_trua WHERE bua_trua.NAME LIKE '%${query}%';`, (error, results) => {
    if (error) throw error;
    response.send(results);
  });
}

module.exports = {
  getHomepage, getLogin, getMeoVat, getMeo, getMonansang, getMonantrua, getMonancreate, postMonan,
  getBuaSang, getBuaTrua, getRegister, getProfile,
  getLogout, getForgotPassword, getSearch
}