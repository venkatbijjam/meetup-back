const shortid = require('shortid')


let randomOTP = (data, callback) => {
  try {
    data.passwordToken = shortid.generate();
    callback(null, data);
  }
  catch (err) {
    callback(err, null);
  }
}



module.exports = {
  randomOTP: randomOTP
}
