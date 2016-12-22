const mongodb = require('../db')
const markdown = require('markdown').markdown

class Article {
  constructor(name, title, content) {
    this.name = name
    this.title = title
    this.content = content
  }

  save(callback) {
    let date = new Date();
    //存储各种时间格式，方便以后扩展
    let time = {
      date: date,
      year: date.getFullYear(),
      month: date.getFullYear() + "-" + (date.getMonth() + 1),
      day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    let article = {
      name: this.name,
      title: this.title,
      content: this.content,
      time: time
    }
    //连接数据库
    mongodb.open((err, db) => {
      if (err) {
        return callback(err)
      }
      //读取集合
      db.collection('articles', (err, collection) => {
        if (err) {
          mongodb.close()
          return callback(err)
        }
        //插入数据
        collection.insert(article, { safe: true }, function (err, user) {
          mongodb.close()
          if (err) {
            return callback(err)//错误，返回 err 信息
          }
          callback(null)
        })
      })
    })
  }

  getAll(name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
      if (err) {
        return callback(err);
      }
      //读取 posts 集合
      db.collection('articles', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        var query = {};
        if (name) {
          query.name = name;
        }
        //根据 query 对象查询文章
        collection.find(query).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if (err) return callback(err);//失败！返回 err
          //解析 markdown 为 html
          docs.forEach(function (doc) {
            doc.content = markdown.toHTML(doc.content);
          });
          callback(null, docs);//成功！以数组形式返回查询的结果
        });
      });
    });
  }

  getOne(name, day, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
      if (err) {
        return callback(err);
      }
      //读取 posts 集合
      db.collection('articles', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //根据用户名、发表日期及文章名进行查询
        collection.findOne({
          "name": name,
          "time.day": day,
          "title": title
        }, function (err, doc) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          //解析 markdown 为 html
          doc.content = markdown.toHTML(doc.content);
          callback(null, doc);//返回查询的一篇文章
        });
      });
    });
  }

  edit(name, day, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
      if (err) {
        return callback(err);
      }
      //读取 posts 集合
      db.collection('articles', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //根据用户名、发表日期及文章名进行查询
        collection.findOne({
          "name": name,
          "time.day": day,
          "title": title
        }, function (err, doc) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null, doc);//返回查询的一篇文章（markdown 格式）
        });
      });
    });
  }

  update(name, day, title, post, callback) {
    // console.log(name+day+title+post);
    //打开数据库
    mongodb.open(function (err, db) {
      if (err) {
        return callback(err);
      }
      //读取 posts 集合
      db.collection('articles', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //更新文章内容
        collection.update({
          "name": name,
          "time.day": day,
          "title": title
        }, {
            $set: { title: title, content: post }
          }, function (err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
            callback(null);
          });
      });
    });
  }

  remove(name, day, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
      if (err) {
        return callback(err);
      }
      //读取 posts 集合
      db.collection('articles', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //根据用户名、日期和标题查找并删除一篇文章
        collection.remove({
          "name": name,
          "time.day": day,
          "title": title
        }, {
            w: 1
          }, function (err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
            callback(null);
          });
      });
    });
  }

}

module.exports = Article