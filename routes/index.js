const express = require('express');
const router = express.Router();
const crypto = require('crypto')
const User = require('../models/user.js')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: '主页',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('register', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
  let name = req.body.username
  let pwd = req.body.password
  let mobile = req.body.mobile
  //生成MD5密码
  let md5 = crypto.createHash('md5')
      pwd = md5.update(pwd).digest('hex')

  let user = new User(name, pwd, mobile)
  user.getByName(user.name, function (err, userb) {
    if (err){
      req.flash('error', err)
      return res.redirect('/')
    }
    if (userb){
      req.flash('error', '用户已经存在！')
      return res.redirect('/reg')
    }
    user.save(function (err, user) {
      if (err){
        req.flash('error', err)
        return res.redirect('/')
      }
        req.session.user = user //save user session
        req.flash('success', '注册成功！')
        res.redirect('/')
    })

  })
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', {
    title: '登陆',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
  let md5 = crypto.createHash('md5'),
      pwd = md5.update(req.body.password).digest('hex')
  User.getByName(req.body.username, function (err, user) {
    if (!user){
      req.flash('error', '用户不存在！')
      return res.redirect('/login')
    }
    if (user.password != pwd){
      req.flash('error', '密码不正确！')
      return res.redirect('/login')
    }
    req.session.user = user
    req.flash('success', '登陆成功！')
    res.redirect('/')
  })
});

router.get('/article', checkLogin);
router.get('/article', function(req, res) {

});

router.post('/article', function(req, res) {

});

function checkLogin(req, res, next) {
  if (!req.session.user){
    req.flash('error', '您还尚未登录！')
    res.redirect('/login')
  }
}

function checkNotLogin(req, res, next){
  if (req.session.user){
    req.flash('error', '已登录！')
    res.redirect('back')
  }
}




module.exports = router;
