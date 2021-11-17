const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const { User } = require("./models/User");

const config = require('./config/key');

// application/x-www-form-urlencoded
app.use(express.urlencoded({extended : true}));

// application/json
app.use(express.json());


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  useNewUrlParser : true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World! 코코 바보'))

// 유저 정보 저장
app.post('/register', (req, res) => {
    
  // 회원 가입 할떄 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body)

  user.save((err, user) => {
    if (err) return res.json({ success: false, err})
    return res.status(200).json({
        success: true
    })
  })
})

// 로그인
app.post('/login', (res, res) => {
  
  // 요청된 이메일을 데이터 베이스에서 찾는다
  User.findOne({ email : res.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess : false, 
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
  })

  // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인. 
  user.comparePassword(req.body.password, (err, isMatch) => {
    if(!isMatch) {
      return res.json({ loginSuccess : false, message: "비밀번호가 틀렸습니다."})
    }

    // 비밀번호가 맞다면 Token 생성
    user.generateToken((err, user) => {

    })
  })

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

