/**
 * 全局配置文件
 *
 * Created by zhanghongqing on 2018/6/29.
 */

module.exports = {
    // mongodb 相关配置
    // 10.211.55.7
    // 192.168.1.105
    mongodb: {
        uri: 'mongodb://192.168.1.105/',
        options: {
            server: {socketOptions: {keepAlive: 1}},
            replset: {socketOptions: {keepAlive: 1}}
        }
    },

    // mysql 相关配置
    mysql: {
        host: '10.10.220.105',
        port: 9306,
        user: 'admin',
        password: 'admin',
        database: 'mysql'
    },

    // redis 相关配置
    redis: {
        host: '127.0.0.1',
        port: 6379,
        password: '123456'
    },

    // server 相关配置
    server: {
        web:{
            port: 4000                          // 服务启动端口号
        },
        face: {
            port: 4102                          // 服务启动端口号
        }
    } 
};