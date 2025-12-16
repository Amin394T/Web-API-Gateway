const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const modulesRouter = require('./routes/modules');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', modulesRouter);

app.listen(PORT, () => {
  console.log(`API Gateway app listening on http://localhost:${PORT}`);
});

module.exports = app;
