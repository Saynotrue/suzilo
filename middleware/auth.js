function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      // 로그인 상태일 때 요청을 계속 처리
      return next();
    }
    // 로그인하지 않은 상태일 때 로그인 페이지로 리다이렉트
    res.redirect('/login');
  }
  
  module.exports = ensureAuthenticated;
  