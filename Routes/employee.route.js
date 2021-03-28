var express = require('express');
var router = express.Router();
var database = require('../Database/database');
var jwt = require('jsonwebtoken');

process.env.SECRET_KEY = "employee-demographics-secret-key";

// route for checking JWTtoken which is default one(i.e. token is essential for accessing any of following routes)...
router.use(function (req, res, next) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                next();
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
});

//route for checking authorized user repective of token...
router.post('/login', function (req, res) {
    var appData = {};
    var email = req.body.email;
    var password = req.body.password;
    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function (err, rows, fields) {
                if (err) {
                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        if (rows[0].password == password) {
                            let token = jwt.sign(rows[0], process.env.SECRET_KEY, { //creating token if user exists in db...
                                expiresIn: 5000
                            });
                            appData.error = 0;
                            appData["token"] = token;
                            res.status(200).json(appData);
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(204).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(204).json(appData);
                    }
                }
            });
            connection.release();
        }
    });
});

//route for getting either all employees list or with provided count...
router.get('/getEmplist', function (req, res) {
    var appData = {};
    var count = req.query.count ? req.query.count : (0, 123456);
    var sql = `SELECT employees.name, employees.designation, salary.amount FROM employees, salary WHERE employees.emp_id = salary.emp_id LIMIT ${count}`;
    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query(sql, function (err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "Data not found.";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});

//route for getting specific employee details...
router.get('/getEmp/:empId', function (req, res) {
    var appData = {};
    var empId = req.params.empId;
    var sql = `SELECT employees.name, employees.designation, salary.amount FROM employees, salary WHERE employees.emp_id = ${empId} AND employees.emp_id = salary.emp_id`
    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query(sql, function (err, rows, fields) {
                if (!err && rows.length > 0) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "Data not found.";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});

module.exports = router;