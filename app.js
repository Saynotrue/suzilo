var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); // express-session 모듈 추가

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 세션 설정
app.use(session({
  secret: 'your-secret-key', // 세션 암호화 키
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: app.get('env') === 'production', // HTTPS 환경에서는 true로 설정
    maxAge: 1000 * 60 * 60 * 24 // 세션 쿠키 유효 기간 (하루)
  }
}));

// 로그인된 사용자 정보를 세션에서 가져와 res.locals에 저장
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // 세션에서 사용자 정보 가져오기
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 설정
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
