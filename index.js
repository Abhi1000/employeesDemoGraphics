const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const routes = require('./Routes/employee.route.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/api', routes);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.listen(port, () => {
    console.log(`Employess Demographics server running on ${port}!!!`);
});
module.exports = app;