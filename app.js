const express      =      require('express');
const path         =      require('path');
const session      =      require('express-session');
const MongoStore   =      require('connect-mongo')(session);
const favicon      =      require('serve-favicon');
const logger       =      require('morgan');
const cookieParser =      require('cookie-parser');
const bodyParser   =      require('body-parser');
const flash        =      require('connect-flash');

const index        =      require('./routes/index');
const users        =      require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'myblog',
  key: 'blog',
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, //a month
  saveUninitialized: false, // don't create session until something stored
  resave: false, //don't save session if unmodified
  store: new MongoStore({
    /*db: 'blog',
    host: 'localhost',
    post: '27017'*/
    url: 'mongodb://localhost/blog'
  })
}));


app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
