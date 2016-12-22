const mongodb = require('../db')

class User {
  constructor(name, password, mobile){
    this.name = name
    this.password = password
    this.mobile = mobile
  }

  getName(){
    return this.name
  }

  save(callback) {
    let user = {
      name: this.name,
      password: this.password,
      mobile: this.mobile,
    }
    //连接数据库
    mongodb.open((err,db) =>{
      if(err){
        return callback(err)
      }
      //读取user集合
      db.collection('users', (err, collection) =>{
        if (err){
          mongodb.close()
          return callback(err)
        }
        //插入数据
        collection.insert(user, {safe: true},function (err, user) {
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

  getOne(id, callback){

  }

}

module.exports = User