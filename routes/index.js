var express = require('express');
var router = express.Router();
const locationModel = require("../model/location");

// 하드코딩된 사용자 정보 (테스트용)
const users = [
  { username: 'administrator', password: '!@#Suzil206' },
];

/* 인증 미들웨어 */
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // 로그인 상태라면 요청 진행
  }
  // 로그인하지 않은 경우 홈 페이지로 리다이렉트하며 에러 메시지 전달
  res.redirect('/?error=Unauthorized access. Please log in first.');
  res.redirect('/');
}

/* GET home page */
router.get('/', (req, res, next) => {
  console.log("index");

  // 에러 메시지 전달
  const error = req.query.error || null;
  const user = req.session.user || null;

  res.render('index', { 
    title: 'Express', 
    user,
    error, // 에러 메시지 전달
  });
});

/* GET upload page (로그인 상태에서만 접근 가능) */
router.get('/upload', ensureAuthenticated, (req, res, next) => {
  res.render('upload', { user: req.session.user });
});

/* GET login page */
router.get('/login', (req, res) => {
  const error = req.query.error || null;
  res.render('login', { error });
});

/* POST login */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 사용자 인증
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // 로그인 성공 시 세션에 사용자 정보 저장
    req.session.user = { username };
    res.redirect('/');
  } else {
    // 로그인 실패 시 로그인 페이지로 리다이렉트
    res.redirect('/login?error=Invalid username or password.');
  }
});

/* GET logout */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

/* POST location data */
router.post("/location", (req, res, next) => {
  const { title, address, lat, lng, area, length } = req.body;
  let location = new locationModel({ title, address, lat, lng, area, length });

  location.save().then(result => {
    console.log(result);
    res.json({ message: "success" });
  }).catch(error => {
    console.log(error);
    res.json({ message: "error" });
  });
});

/* GET all location data */
router.get("/location", (req, res, next) => {
  locationModel.find({}, { _id: 0, __v: 0 }).then(result => {
    console.log(result);
    res.json({
      message: "success",
      data: result,
    });
  }).catch(error => {
    console.log(error);
    res.json({
      message: "error",
      data: null,
    });
  });
});

module.exports = router;
