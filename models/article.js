const mongodb = require('../db')

class Article {
  constructor(name, title, content){
    this.name = username
    this.title = title
    this.content = content
  }

  save(callback) {
    let date = new Date();
    //存储各种时间格式，方便以后扩展
    let time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    let article = {
      name: this.name,
      password: this.password,
      content: this.content,
      time: time
    }
    //连接数据库
    mongodb.open((err,db) =>{
      if(err){
        return callback(err)
      }
      //读取集合
      db.collection('articles', (err, collection) =>{
        if (err){
          mongodb.close()
          return callback(err)
        }
        //插入数据
        collection.insert(article, {safe: true},function (err, user) {
          if (err) {
            return callback(err)//错误，返回 err 信息
          }
          callback(null, user[0])
        })
      })
    })
  }

  getByName(name, callback) {
    mongodb.open(function (err, db) {
      if (err) {
        return callback(err);//错误，返回 err 信息
      }
      //读取 users 集合
      db.collection('users', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);//错误，返回 err 信息
        }
        //查找用户名（name键）值为 name 一个文档
        collection.findOne({
          name: name
        }, function (err, user) {
          mongodb.close();
          if (err) {
            return callback(err);//失败！返回 err 信息
          }
          callback(null, user);//成功！返回查询的用户信息
        });
      });
    });
  }

}

module.exports = User