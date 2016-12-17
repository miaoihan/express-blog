const mongo = require('mongodb');

const host = 'localhost';
// can not defined DEFAULT_PORT
// const port = mongo.Connection.DEFAULT_PORT;
const port = 27017;
const server = new mongo.Server(host, port, {auto_reconnect:true});

module.exports = new mongo.Db('blog',server,{safe:true});