const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

const config = require('./config/key');

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cookieParser());


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  useNewUrlParser : true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World! 코코 바보'))

app.get('/api/hello', (req, res) => res.send('hiiiiiiiiii'))

// 유저 정보 저장
app.post('/api/users/register', (req, res) => {
    
  // 회원 가입 할떄 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body)

  user.save((err, user) => {
    if (err) return res.json({ success: false, err})
    return res.status(200).json({
        success: true
    })
  })
});

// 로그인
app.post('/api/users/login', (req, res) => {
  // 요청된 이메일을 데이터 베이스에서 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) 
      return res.json({
          loginSuccess: false,
          message: "아이디가 없으심"
      });

    // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인. 
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호 틀리심" });

      // 비밀번호가 맞다면 Token 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? cookie, localStorage, session 등.. 
        res
            .cookie("x_auth", user.token)
            .status(200)
            .json({
                loginSuccess: true, userId: user._id
            });
      });
    });
  });
});

// 인증 기능
app.get('/api/users/auth', auth, (req, res) => {
  // 미들웨어 통과 후 실행될 코드
  // 미들웨어를 통화했다 => Authentication가 Ture다.

  // 클라이언트에 응답, 어떤 정보를?
  res.status(200).json({ 
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
});

// 로그아웃 : 로그아웃 하려는 유저를 데이터 베이서에서 찾아서 업데이트
app.get('/api/users/logout', auth, (req, res) => {
  // user._id : 미들웨어 auth user 를 찾음 , 그 유저의 토큰을 지워준다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, decode) => {  
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
          success: true
      });
  });
});


const port = 5000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

