const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
   name: {
      type:String,
      maxlength:50
   },
   email: {
      type:String,
      trim:true,
      unique: 1 
   },
   password: {
      type: String,
      minglength: 5
   },
   lastname: {
      type:String,
      maxlength: 50
   },
   role : {
      type:Number,
      default: 0 
   },
      image: String,
   token : {
      type: String,
   },
   tokenExp :{
      type: Number
   }
})

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

// 비밀번호 비교 메소드 생성 : plainPassword를 암호화 시켜서 비교한다.
userSchema.methods.comparePassword = function(plainPassword, cb) {

   // ex) plainPassword 1234567 === hashPassword : $2b$10$smjX/wlIpdOM4 
   bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
      
      });
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

const User = mongoose.model('User', userSchema)
module.exports = { User }