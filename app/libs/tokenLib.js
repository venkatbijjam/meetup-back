const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const secretKey = 'someVeryRandomStringThatNobodyCanGuess';


let generateToken = (data, cb) => {

  try {
    let claims = {
      jwtid: shortid.generate(),
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
      sub: 'authToken',
      iss: 'edChat',
      data: data
    }
    let tokenDetails = {
      token: jwt.sign(claims, secretKey),
      tokenSecret : secretKey
    }
    cb(null, tokenDetails)
  } catch (err) {
    console.log(err)
    cb(err, null)
  }
}// end generate token 


//genereate paswordresettoken

let generatePasswordToken = (data, cb) => {

  try{
    let tokenDetails = {
      token:shortid.generate()
     
    }
    cb(null, tokenDetails)
  } catch (err) {
    console.log(err)
    cb(err, null)
  }
}// end generate token 

let verifyClaim = (token, secretKey,callback) => {
  // verify a token symmetric
  try{

  
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      console.log("error while verify token");
      console.log(err);
      callback(err,null)
    }
    else{
      console.log("user verified");
      callback(null,decoded);
    }  
 
 
  });

} catch(err){
  console.log(err)
  cb(err,null)
}

}// end verify claim 


let verifyClaimWithoutSecret = (token,cb) => {
  // verify a token symmetric
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      console.log("error while verify token");
      console.log(err);
      cb(err,decoded)
    }
    else{
      console.log("user verified");
      cb (null,decoded)
    }  
 
 
  });
}

module.exports = {
  generateToken: generateToken,
  verifyToken :verifyClaim,
  verifyClaimWithoutSecret:verifyClaimWithoutSecret,
  generatePasswordToken:generatePasswordToken
}