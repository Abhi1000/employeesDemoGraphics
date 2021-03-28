var mysql = require('mysql');

var connection = mysql.createPool({
    connectionLimit: 100,
    host:'localhost',
    user:'root',
    password:'abhishek100',
    database:'employeeDemoGraphics',
    multipleStatements: true
});

module.exports.connection = connection;