# React & Node.js boiler-plate 📝
회원가입, 로그인, Auth, 로그아웃 기능 with John Ahn 
## 무엇을 알고 싶었나?
1. session 방식과, jwt 방식 차이
2. password 암호화 하는 법
3. schema 만드는법
4. mongoose
5. react !!!! 🐾

## 💡 기술
- Client : React, Redux, Ant Design
- Server: Express, MongoDB

## 라이브러리 정리
- Client :  react-router-dom, axios, concurrently, http-proxy-middleware, redux, react-redux, redux-promise, redux-thunk
- Server : nodemon, express, mongoose, body-parser, jsonwebtoken, cookie-parser, body-parser

# 0. 초기 세팅
## Client : React 설치
> npx create-react-app

## Server : Node.js 설치
> node -v : 버전확인
>
> npm init => package.json =>
>
> script : “start” : “node index.js”

## Global : Concurrently

> npm install concurrently --save 
>
> package.json => 
>
> script :  "dev":  "concurrently \"npm run backend\" \"npm run start --prefix client\""

## 1. Client Setting 💛

## Axios

> npm install axios --save

## Proxy

CORS : 클라이언트와 서버가 다른포트를 가지고 있을 경우 발생하는 문제. Proxy로 문제 해결

> npm install http-proxy-middleware --save

```javascript
⭐ client/src/setupProxy
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  )
}
```

## Ant Design

: CSS 프레임워크

> npm install antd --save

## 2. Sever Setting 💜

## MongoDB

클러스터, user 생성

## Express 

> npm install express --save

```javascript
⭐ server/index.js
const express = require('express')
const app = express()
const port = 5000
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

## Nodemon

> npm install nodemon --save-dev
>
> package.json =>
>
> script : “backend” : “nodemon index.js”

## Mongoose & Schema 생성

> npm install mongoose --save

```javascript
⭐ server/model/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})
const User = mongoose.model('User', userSchema);
module.exports = { User };

⭐ server/index.js
const mongoose = require('mongoose');
mongoose.connect('mongoURI', {
  useUnifiedTopology: true, useNewUrlParser: true
}).then(() => console.log('MongoDB Connected..'))
  .catch(err => console.log(err))
```

## BodyParser

클라이언트 POST 요청 데이터의 body로부터 파라미터를 편리하게 추출

> npm install body-parser --save
>
> ```javascript
> ⭐ server/index.js
> const bodyParser = require('body-parser');
> const { User } = require("./models/User");
> app.use(express.urlencoded({extended : true}));
> app.use(express.json());
> 
> app.post('/register', (req, res) => {
>     // 필요한 정보들을 cclient에서 가져오면
>     // 그것들을 데이터 베이스에 넣어준다.
>     const user = new User(req.body)
> 
>     user.save((err, userInfo) => {
>         if (err) return res.json({ success: false, err})
>         return res.status(200).json({
>             success: true
>         })
>     })
> })
> // 포스트맨에서 post요청
> ```

## Mongoose 정보 관리

```javascript
⭐ server/index.js
const config = require('./config/key');
mongoose.connect(config.mongoURI, ...)
                 
⭐ server/config/key.js
module.exports = {
	// MONGO_URI는 배포시 이름과 동일하게
	mongoURI: process.env.MONGO_URI
}

⭐ server/config/dev.js
module.exports = {
    mongoURI: 'Mongo Connect URI'
}
```

## SSH를 통한 GitHub 연결

### .gitignore

> node_modules
>
> dev.js

# 1. 회원가입

## Server 💜

## Bctypt 비밀번호 암호화

bcrypt.genSalt : DB저장전에 전달받은 비밀번호를 Salt를 이용해 암호화
saltRounds  : Salt가 몇 글자인지

> $ npm install bcrypt --save

```javascript
⭐ models/User.js
const bcrypt = require('bcrypt');
const saltRounds = 10; 

// pre : 저장하기 전에 할 일
userSchema.pre('save', function (next) {
    let user = this; // userSchema를 가리킴
 
    // isModified : userSchema에서 비밀번호 변환시에만 할일
    if(user.isModified('password')) {
       // salt 생성 => salt를 이용해서 비밀번호를 암호화
       bcrypt.genSalt(saltRounds, (err, salt) => {
          if(err) return next(err)
 
          bcrypt.hash(user.password, salt, (err, hash) => {
          if(err) return next(err)
          user.password = hash 
          next() // next : index.js / user.save 로 돌려보냄
          })
       })
    } else { 
       next()
    }
});
```

# 2. 로그인

## Server 💜

1. 요청된 아이디가 데이터 베이스에 있는지 찾는다. (User.findeOne)

2. 있다면, 비밀번호가 맞는지 확인한다. (userSchema.methods.comparePassword)

3. 맞다면 그때 토큰을 생성한다. 
4. 쿠키에 토큰을 저장한다.

## Token 생성 (JWT)

> npm install jsonwebtoken --save

```javascript
⭐ models/User.js
const jwt = require('jsonwebtoken')

// 비밀번호 비교 메소드 생성 : plainPassword를 암호화 시켜서 비교한다.
userSchema.methods.comparePassword = function(plainPassword, call) {

    // ex) plainPassword 1234567 === hashPassword : $2b$10$smjX/wlIpdOM4 
    bcrypt.compare(plainPassword, this.password, 
        function(err, isMatch) {
            if(err) return call(err), 

            // 에러는 null, 결과값 : isMatch (성공)
            call(null, isMatch)
    })
}

// jsonToken 생성 메소드
userSchema.methods.generateToken = function(cb) {
    let user = this;
 
    // jwt.sign(유저아이디, '작명') 
    let token = jwt.sign(user._id.toHexString(), 'secretToken'); // user._id : database / _id
 
    // user._id + 'secretToken' = token
    // input : 작명, output : user._id 
    // 작명'(아이디)를 가지고 누군지 판단
 
    user.token = token;
    user.save((err, user) => {
       if(err) return cb(err);
       cb(null, user) // 성공시 에러 null, user 정보 전달
    })
 }
```

## Cookie 저장

> npm install cookie-parser --save

```javascript
⭐ server/index.js
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.post('/api/users/login', (req, res) => {

  // 1. 요청된 이메일을 데이터 베이스에서 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.'
      })
    }

    // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인. 
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) // 결과가 맞지 않다면
        return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다.'})

      // 3. 비밀번호가 맞다면 Token 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err)

        // 4. 토큰을 저장한다. 어디에? cookie, localStorage, session 등.. 
        res.cookie('x_auth', user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})
```

## Auth (인증)

## Auth models

```javascript
⭐ models/User.js

// 토큰 복호화 메소드 생성
userSchema.statics.findByToken = function(token, cb) {
   let user = this; // userSchema를 가리킴

   // verify: 토큰을 decode(복호화) 함수
   // decoded = 복호화된 유저아이디
   jwt.verify(token, 'secretToken', function(err, decode) { // 토큰 검증

      // 유저 아이디를 이용해, 유저를 찾는다.
      user.findOne({ "_id" : decode, "token" : token}, function(err, user) {
         if(err) return cb(err);
         cb(null, user)       
      })
   }) 
}
```

## Auth middleware 

```javascript
const { User } = require('../models/User');

// 인증처리 미들웨어 생성
let auth = (req, res, next) => {

   // 클라이언트 쿠키에서 토큰을 가져온다. (Cookie-parser이용)
   let token = req.cookies.x_auth;

   // token을 decode(복호화) 한 후에,
   // token과 DB에 보관된 토큰이 일치하는지 확인한다.
   User.findByToken(token, (err, user) => {
      if (err) throw err;
      if (!user)
         return res.json({
         isAuth: false,
         error: true
      });

      req.token = token; // 복호화 된 token 저장
      req.user = user; // 복호화 된 user 저장
      next(); // index.js로 데이터 가지고 돌아가기 : next 안쓰면 이 미들웨어에 갇히게 된다.
   })
}


module.exports = { auth };
```

## Auth server

```javascript
⭐ server/index.js

// 인증 기능
const { auth } = require("./middleware/auth");

app.get('/api/users/auth', auth, (req, res) => {
   // 미들웨어 통과 후 실행될 코드
   // 미들웨어를 통화했다 => Authentication가 Ture다.
 
   // 클라이언트에 응답, 어떤 정보를?
   res.status(200).json({ 
     // auth.js에서 user정보를 넣었기 때문에 user._id가 가능
     _id: req.user._id, 
     // cf) role이 0 이면 일반유저, role이 아니면 관리자
     isAdmin: req.user.role === 0 ? false : true,
     isAuth: true,
     email: req.user.email,
     name: req.user.name,
     lastname: req.user.lastname,
     role: req.user.role,
     image: req.user.image,
   })
 });
```

# 3. 로그아웃

로그아웃 하려는 유저를 데이터베이스에서 찾아서 그 유저의 토큰을 지워준다.

## server 💜

``` javascript
⭐ server/index.js

// auth를 넣는 이유는 login이 되어있는 상태이기 때문에
app.get('/api/users/logout', auth, (req, res) => {
  
   // user._id : 미들웨어 auth user 를 찾음 , 그 유저의 토큰을 지워준다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).send({
      success: true,
    })
  })
  
})
```

