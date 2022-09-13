// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()
const joi = require('joi')
// 导入 cors 中间件
const cors = require('cors')

// 导入配置文件
const config = require('./config')
// 解析 token 的中间件
const expressJWT = require('express-jwt')

// 将 cors 注册为全局中间件
app.use(cors())

//配置解析表单数据的中间件,只能解析application/x-www-form-urlencoded表单数据
app.use(express.urlencoded({ extended: false }))
//封装全局返回函数
// 响应数据的中间件
app.use(function (req, res, next) {
    // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function (err, status = 1) {
        console.log("err的数据为===>",err)
        res.send({
            // 状态
            status:status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})

//一定要在导入路由之前
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))

//1.第一个模块(登录注册模块)
// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)  //都需要增加/api的前缀

//2.第二个模块(个人信息模块)
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)


// 定义错误中间件
app.use(function (err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError)
        return res.cc(err)
    if (err.name === 'UnauthorizedError')
        return res.cc('身份认证失败！')   //如果没有token并且没有/api就报错
    // 未知错误
    res.cc(err)
})


// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, function () {
    console.log('api server running at http://127.0.0.1:3007')
})