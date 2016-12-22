const express = require('express');
const router = express.Router();
const crypto = require('crypto')
const User = require('../models/user.js'),
      userDao = new User()
      Article = require('../models/article')
      artDao = new Article()

/* GET home page. */
router.get('/', function(req, res) {
  artDao.getAll(null, function (err, articles) {
    if (err) {
      articles = [];
    }
    res.render('index', {
      title: '主页',
      user: req.session.user,
      articles: articles,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
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
  userDao.getByName(req.body.username, function (err, user) {
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

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null
  res.redirect('/')
});

router.get('/article', checkLogin);
router.get('/article', function(req, res) {
  res.render('article', {
    title: '文章',
    article: {},
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/article', checkLogin);
router.post('/article', function(req, res) {
  let currentUser = req.session.user,
      article = new Article(currentUser.name, req.body.title, req.body.content);
  article.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');//发表成功跳转到主页
  });
});

router.get('/u/:name', function (req, res) {
  //检查用户是否存在
  userDao.getByName(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/');//用户不存在则跳转到主页
    }
    //查询并返回该用户的所有文章
    artDao.getAll(user.name, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });
});

router.get('/u/:name/:day/:title', function (req, res) {
  artDao.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('articleDtl', {
      title: req.params.title,
      article: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function (req, res) {
  var currentUser = req.session.user;
  artDao.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    res.render('articleEdit', {
      title: '编辑',
      article: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function (req, res) {
  var currentUser = req.session.user;
  artDao.update(currentUser.name, req.params.day, req.body.title, req.body.content, function (err) {
    var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
    if (err) {
      req.flash('error', err);
      return res.redirect(url);//出错！返回文章页
    }
    req.flash('success', '修改成功!');
    res.redirect(url);//成功！返回文章页
  });
});

router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function (req, res) {
  var currentUser = req.session.user;
  artDao.remove(currentUser.name, req.params.day, req.params.title, function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', '删除成功!');
    res.redirect('/');
  });
});

//---- 中间件 ----
function checkLogin(req, res, next) {
  if (!req.session.user){
    req.flash('error', '您还尚未登录！')
    res.redirect('/login')
  }
  next()
}

function checkNotLogin(req, res, next){
  if (req.session.user){
    req.flash('error', '已登录！')
    res.redirect('back')
  }
  next()
}

module.exports = router;