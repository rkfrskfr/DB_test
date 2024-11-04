var express = require('express');
var router = express.Router();
const pool = require("../db/db");

/**
 * 회원가입 페이지 이동
 */
router.get('/signup', async(req, res) => {
  console.log('회원가입 페이지');
  res.render('users/signup', {
    user_id: req.session.user_id,
  });
});

/**
 * 회원가입 기능
 */
router.post('/signup', async(req, res) => {
  const{ user_id, password, name } = req.body;
  console.log("아이디: ", user_id);

  const saveUser = await pool.query(
    "insert into user(user_id, password, name) values (?, ?, ?);",
    [user_id, password, name]
  );

  const saveCart = await pool.query(
    'insert into cart(user_id, create_date) values(?, now())',
    [user_id]
  );

  return res.send(
    `<script>location.href = "/";</script>`
  );
});

/**
 * 로그인 페이지 이동
 */
router.get('/signin', async (req, res) => {
  console.log('로그인 페이지');
  res.render('users/signin', {
    user_id: req.session.user_id,
  });
});

/**
 * 로그인 기능
 */
router.post('/signin', async (req, res) => {
  const{ user_id, password } = req.body;

  const [findByUserId] = await pool.query(
    "select * from user where user_id = ?",
    [user_id]
  );

  if (findByUserId == 0) {
    res.render("존재하지 않는 아이디입니다.");
  }
  
  const user = findByUserId[0];
  if (password != user.password) {
    res.render("비밀번호가 일치하지 않음");
  }

  // 세션에 저장
  req.session.user_id = user.user_id;
  req.session.name = user.name;

  return res.send(`<script> location.href = "/"; </script>`);
});

/**
 * 로그아웃
 */
router.get('/logout', async(req, res) => {
  if(req.session) {
    req.session.destroy(()=>{
      res.redirect('/');
    });
  } else {
    console.log("세션 없음");
  }
});

module.exports = router;
