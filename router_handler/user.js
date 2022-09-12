/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
//导入数据库模块
const db = require('../db/index')
//导入加密库
const bcrypt = require('bcryptjs')
// 注册用户的处理函数
exports.regUser = (req, res) => {
    console.log("regUser中req的值===>",req.body)  //req.body获取到提交的表单数据
    // 接收表单数据
    const userinfo = req.body
    // 判断数据是否合法
    if (!userinfo.username || !userinfo.password) {
        return res.send({ status: 1, message: '用户名或密码不能为空！' })
    }
    //定义SQL语句
    const sqlStr = `select * from ev_users where username=?`
    //只有一个参数的时候，我们可以去掉[],也可以不去
    db.query(sqlStr, [userinfo.username], function (err, results) {  //返回的results是数组
        // 执行 SQL 语句失败
        if (err) {
            return res.send({ status: 1, message: err.message })
        }
        // 用户名被占用
        if (results.length > 0) {
            return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
        }
        // TODO: 用户名可用，继续后续流程...
    })
    console.log("加密前===>",userinfo)
    // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    console.log("加密后===>",userinfo)

    const sql = 'insert into ev_users set ?'
    db.query(sql, { username: userinfo.username, password: userinfo.password }, function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.send({ status: 1, message: err.message })
        // SQL 语句执行成功，但影响行数不为 1
        if (results.affectedRows !== 1) {
            return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
        }
        // 注册成功
        res.send({ status: 0, message: '注册成功！' })
    })
}
// 登录的处理函数
exports.login = (req, res) => {
    console.log("login中req的值===>",req)
    res.send('login OK')
}