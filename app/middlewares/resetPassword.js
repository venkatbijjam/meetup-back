const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require("request")
const UserModel = mongoose.model('Users')
const time = require('./../libs/timeLib');

const logger = require('./../libs/loggerLib')
const response = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let OTPcheck = (req, res, next) => {

    UserModel.findOne({ email: req.body.email }, (err, retriveDetails) => {
        if (err) {
            logger.error(err.message, 'userController: checkPasswordResetOTP', 10)
            let apiResponse = response.generate(true, 'Failed to retrive data from DB', 500, null)
            res.send(apiResponse);
        }
        else if (check.isEmpty(retriveDetails)) {
            logger.error(err, 'userController: checkPasswordResetOTP', 10)
            let apiResponse = response.generate(true, 'Email is not Registered', 500, null)
            res.send(apiResponse);

        }
        else {
            //comparing the OTP
            if (check.isEmpty(req.body.otp)) {
                logger.error(err, 'userController: checkPasswordResetOTP', 10)
                let apiResponse = response.generate(true, 'InValid OTP', 500, null)
                res.send(apiResponse);

            }
            else if ((req.body.otp.toString().trim() == retriveDetails.resetPasswordToken.toString().trim())
                && (time.compareWithToday(retriveDetails.resetPasswordExpires))) {
                next();
            }
            else {
                logger.error(err, 'userController: checkPasswordResetOTP', 10)
                let apiResponse = response.generate(true, 'InValid OTP or OTP Expired', 500, null)
                res.send(apiResponse);
            }
        }
    })
}


module.exports = {
    OTPcheck: OTPcheck
}
