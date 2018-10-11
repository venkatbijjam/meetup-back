const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require("request")
const UserModel = mongoose.model('Users')
const time = require('./../libs/timeLib');

const logger = require('./../libs/loggerLib')
const response = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let isAdmin = (req, res, next) => {
    UserModel.findOne({ email: req.body.email || req.query.email} , (err, retriveDetails) => {
        if (err) {
            logger.error(err.message, 'MiddleWare: checkPasswordResetOTP', 10)
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
            if (retriveDetails.admin) {
               next();
            }
           
        }
    })
}


module.exports = {
    isAdmin: isAdmin
}
