const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('../libs/tokenLib')
const mail = require('../libs/mailSender');
const mailTemplete = require('../libs/mailTemplate');
const OTP = require('../libs/forgetPassword');
/* Models */
const UserModel = mongoose.model('Users')
const AuthModel = mongoose.model('Auths')



/** 
 * Login Functionality
 *  signin, Signup,Logout, update passsword and reset passwords
 */

//sign up function starting..

let signUpFunction = (req, res) => {

    let validateUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement or invalid Email', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing(empty)"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }

            } else {
                logger.error('Field Missing During User Creation', 'userController: validateUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) found is missing', 400, null)
                reject(apiResponse)
            }
        });

    } // end of validateuser function

    //creating user profile in database
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.find({ email: req.body.email.toLowerCase() })
                .exec((err, retrivedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10);
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(retrivedUserDetails)) {
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            userName: req.body.userName,
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            resetPasswordExpires: null,
                            admin: req.body.isAdmin,
                            resetPasswordToken: '',
                            createdOn: time.now(),
                            status:false,
                            isOnline:false
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User profile in DB', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                let mailOptions = mailTemplete.welcomeMail(newUserObj.email, newUserObj.userName,newUser._id);
                                mail.sendingMails(mailOptions);
                                resolve(newUserObj)
                            }
                        })
                    }
                    else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        });

    } // end of create user function

    // send validation email
   


    //validating user and creating user profile i.e calling above methods
    validateUser(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password;
            delete resolve._id;
            delete resolve.__v;
            delete resolve.createdOn;
            delete resolve.status;
            delete resolve.resetPasswordToken;
            delete resolve.resetPasswordExpires;
            
            let apiResponse = response.generate(false, 'User profile is created', 200, resolve);
            res.send(apiResponse);

        })

        .catch((err) => {
            res.send(err);
        })
} //end of signUp Fucntion


let loginFunction = (req, res) => {

    let finduser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                UserModel.findOne({ email: req.body.email.toLowerCase() }, (err, userDetails) => {

                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        if(userDetails.status){
                        logger.info('User Found', 'userController: findUser()', 10)

                            resolve(userDetails)

                        } else{
                            logger.error('email is not validated', 'userController: findUser()', 7)
                            let apiResponse = response.generate(false, 'Email is not validated', 500, null)
                            reject(apiResponse)
                        }
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        });


    } //end of finding user function

    let validatePassword = (retrievedUserDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    } // end of validate password funtion

    let generateToken = (userDetails) => {

        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    } // generating JWT token

    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }

                            resolve(responseBody)
                        }
                    })
                }
            })
        })

    } // end of token saving funciton


    finduser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
} // singin function end

// logout function deleting token stoted in DB
let logout = (req, res) => {

    AuthModel.findOneAndRemove({ 'userId': req.query.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of logout function

// forgot password function

let reestPassword = (req, res) => {

    //finding the email id of user
    let finduser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                UserModel.findOne({ email: req.body.email.toLowerCase() }, (err, userDetails) => {

                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        });
    } //end of finding user function

    //generating password reset token
    let generateToken = (userDetails) => {

        return new Promise((resolve, reject) => {
            token.generatePasswordToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    logger.error('Failed to generate password', 'userController: generateOTP()', 7)

                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    } // generating JWT token


    //saving OTP to database
    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: tokenDetails.userId }, (err, retriveUser) => {
                if (err) {
                    logger.error('No User Found', 'userController: saveOTP()- no User', 8)
                    let apiResponse = response.generate(true, 'Failed To Save Password Token', 500, null)
                    reject(apiResponse)
                }

                else if (check.isEmpty(retriveUser)) {
                    logger.error('No User Found', 'userController: saveOTP()- no User', 8)
                    let apiResponse = response.generate(true, 'No Details Found', 500, null)
                    reject(apiResponse)
                }
                else {
                    retriveUser.resetPasswordToken = tokenDetails.token;
                    retriveUser.resetPasswordExpires = time.passwordExpireDate();
                    retriveUser.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(err.message, 'userController: Save OTP', 10)
                            let apiResponse = response.generate(true, 'Failed To save Token', 500, null)
                            reject(apiResponse)
                        } else {

                            resolve(newTokenDetails)
                        }
                    })
                }

            });

        });

    } //saving the OTP in database

    // send mai to user
    let sendMailtouser = (newTokenDetails) => {

        return new Promise((resolve, reject) => {
            mailTemplete.recentPasswordMail(newTokenDetails, (err, mailOptions) => {
                if (err) {
                    logger.error(err.message, 'userController: sendMailtouser', 10)
                    let apiResponse = response.generate(true, 'Failed To Send Mail', 500, null)
                    reject(apiResponse)
                } else {
                    mail.sendingMails(mailOptions);
                    let responseBody = {
                        email: newTokenDetails.email,
                        expiryDate: newTokenDetails.resetPasswordExpires
                    }
                    resolve(responseBody)
                }
            });

        });


    } // end of sending mail to user

    finduser(req, res)
        .then(generateToken)
        .then(saveToken)
        .then(sendMailtouser)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Send Mail Successfully', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

} // reseting the password end of function

//  validate OTP
let checkPasswordReset = (req, res) => {

    // check OTP is valid or not
    let checkToken = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email }, (err, retriveDetails) => {
                if (err) {
                    logger.error(err.message, 'userController: checkPasswordResetOTP', 10)
                    let apiResponse = response.generate(true, 'Failed to retrive data from DB', 500, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(retriveDetails)) {
                    logger.error(err, 'userController: checkPasswordResetOTP', 10)
                    let apiResponse = response.generate(true, 'Email is not Registered', 500, null)
                    reject(apiResponse)
                }
                else {
                    //comparing the OTP
                    
                    if (check.isEmpty(req.body.token)) {
                        logger.error(err, 'userController: checkPasswordResetOTP', 10)
                        let apiResponse = response.generate(true, 'InValid OTP', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(req.body.token) || check.isEmpty(retriveDetails.resetPasswordToken)){
                        let apiResponse = response.generate(true, 'No token found', 500, null)
                        reject(apiResponse)
                    }
                    else if ((req.body.token.toString().trim() == retriveDetails.resetPasswordToken.toString().trim())
                        && (time.compareWithToday(retriveDetails.resetPasswordExpires))) {
                        resolve(retriveDetails);
                    }
                    else {
                        logger.error(err, 'userController: checkPasswordResetOTP', 10)
                        console.log(req.body.token.toString().trim())
                        console.log(retriveDetails.resetPasswordToken.toString().trim())
                        
                        let apiResponse = response.generate(true, 'InValid token or token Expired', 500, null)
                        reject(apiResponse)
                    }
                }
            })


        });

    }

    let changePassword = (retriveDetails) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: retriveDetails.userId }, (err, result) => {
                if (err) {
                    logger.error(err.message, 'userController: changePassword', 10)
                    let apiResponse = response.generate(true, 'Failed To update password', 500, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(result)) {
                    logger.error('No User Found', 'userController: changePassword()- no User', 8)
                    let apiResponse = response.generate(true, 'No Details Found', 500, null)
                    reject(apiResponse)
                }
                else {
                    result.password = passwordLib.hashpassword(req.body.password)
                    result.resetPasswordToken = null
                    result.resetPasswordExpires = null
                    result.save((err, updateddetails) => {

                        if (err) {
                            logger.error(err.message, 'userController: changePassword', 10)
                            let apiResponse = response.generate(true, 'Failed To update password', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            resolve(updateddetails);
                        }
                    })
                }

            });

        });
    } // update password

    // send mail to user to notify password reset sucessfully
    let sendMailtouser = (updateddetails) => {

        return new Promise((resolve, reject) => {
            mailTemplete.updatePassword(updateddetails, (err, mailOptions) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: sendMailtouser', 10)
                    let apiResponse = response.generate(true, 'Failed To Send Mail', 500, null)
                    reject(apiResponse)
                } else {
                    mail.sendingMails(mailOptions);
                    let responseBody = {
                        email: updateddetails.email
                    }
                    resolve(responseBody)
                }
            });

        });


    } // end of notify password reset mail to user

    checkToken(req, res)
        .then(changePassword)
        .then(sendMailtouser)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password Reset Sucessfully', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
    // 



} // end of validating OTP

// update password

let changePassword = (req, res) => {

    // finding the user details
    let finduser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                UserModel.findOne({ email: req.body.email.toLowerCase() }, (err, userDetails) => {

                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)

                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        });


    } //end of finding user function

    //compare old password
    let valiateOldPassword = (userDetails) =>{
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.oldPassword, userDetails.password, (err, isMatch) => {
                if (err) {
                    logger.error(err.message, 'userController: valiateOldPassword()', 10)
                    let apiResponse = response.generate(true, 'Error while comparing the passwords', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retriveDetails = userDetails.toObject()
                    delete retriveDetails.password
                    delete retriveDetails._id
                    delete retriveDetails.__v
                    delete retriveDetails.createdOn
                    delete retriveDetails.modifiedOn
                    resolve(retriveDetails)
                } else {
                    logger.info('Password is not matched', 'userController: valiateOldPassword()', 10)
                    let apiResponse = response.generate(true, 'Password is not matched with old password', 400, null)
                    reject(apiResponse)
                }
            })
        })
    } // emd of password matching


    // update password
    let changePassword = (retriveDetails) => {
        return new Promise((resolve, reject) => {

            UserModel.findOne({ userId: retriveDetails.userId }, (err, result) => {

                if (err) {
                    logger.error(err.message, 'userController: changePassword', 10)
                    let apiResponse = response.generate(true, 'Failed To update password', 500, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(result)) {
                    logger.error('No User Found', 'userController: changePassword()- no User', 8)
                    let apiResponse = response.generate(true, 'No Details Found', 500, null)
                    reject(apiResponse)
                }
                else {
                    result.password = passwordLib.hashpassword(req.body.password)
                    result.modifiedOn =time.now()
                    result.save((err, updateddetails) => {
                        if (err) {
                            logger.error(err.message, 'userController: changePassword', 10)
                            let apiResponse = response.generate(true, 'Failed To update password', 500, null)
                            reject(apiResponse)
                        }

                        else {
                            resolve(updateddetails);
                        }
                    })
                }

            });

        });
    } // update password

    // send mail to user to notify password updated sucessfully
    let sendMailtouser = (updateddetails) => {

        return new Promise((resolve, reject) => {
            mailTemplete.updatePassword(updateddetails, (err, mailOptions) => {
                if (err) {
                    logger.error(err.message, 'userController: sendMailtouser', 10)
                    let apiResponse = response.generate(true, 'Failed To Send Mail', 500, null)
                    reject(apiResponse)
                } else {
                    mail.sendingMails(mailOptions);
                    let responseBody = {
                        email: updateddetails.email
                    }
                    resolve(responseBody)
                }
            });

        });


    } // end of notify password reset mail to user


    finduser(req, res)
        .then(valiateOldPassword)
        .then(changePassword)
        .then(sendMailtouser)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password updated Sucessfully', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
} // end of password update 



/**
 * user retreving functions
 */
/**
 * user CRUD Operations
 */
 
/* Get all user Details */
let getAllUser = (req, res) => {
    UserModel.find({status:true})
        .select(' -__v -_id -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users

/* Get single user details */
let getSingleUser = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller:getSingleUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single user

//delete user
let deleteUser = (req, res) => {

    UserModel.findOneAndRemove({ 'userId': req.params.userId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: deleteUser', 10)
            let apiResponse = response.generate(true, 'Failed To delete user', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: deleteUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the user successfully', 200, result)
            res.send(apiResponse)
        }
    });// end user model find and remove


}// end delete user

let editUser = (req, res) => {

    let options = req.body;
    UserModel.update({ 'userId': req.params.userId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller:editUser', 10)
            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details edited', 200, "null")
            res.send(apiResponse)
        }
    });// end user model update


}// end edit user

let validateEmail= (req,res) =>{
    
   UserModel.findOne({'_id': req.params.userId},(err,data)=>{
       if(err){
        logger.error('Failed to Update', 'userController: validateEmail()', 5)
        let apiResponse = response.generate(true, 'invalid Code details', 400, null)
        res.send(apiResponse)
       } else if(check.isEmpty(data)){
        logger.error('Failed to Update', 'userController: validateEmail()', 5)
        let apiResponse = response.generate(true, 'Unable to retreive details', 400, null)
        res.send(apiResponse)
       } else{
           data.status =true;
           data.modifiedOn=time.now();
           data.save((err,details) =>{
               if(err){
                logger.error('Failed to Update', 'userController: validateEmail()', 5)
                let apiResponse = response.generate(true, 'Unable to validate details', 400, null)
                res.send(apiResponse)
               } else{
                let apiResponse = response.generate(false, 'Email Verified', 200, null)
                res.send(apiResponse)
               }
           })
       }
   })

}


let setAndRemoveOnline = (allOnlineUsers) =>{
    UserModel.updateMany({ status: true }, { $set: { isOnline: false } }, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            allOnlineUsers.forEach(element => {
                console.log(element.userId)
                UserModel.updateMany({ userId: element.userId }, { $set: { isOnline: true } }, (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Updated")
                    }
                })
            });
        }
    })
}

/*
** Module export
*/


module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    reestPassword: reestPassword,
    checkPasswordReset: checkPasswordReset,
    changePassword: changePassword,
    getAllUser:getAllUser,
    getSingleUser:getSingleUser,
    deleteUser:deleteUser,
    editUser:editUser,
    setAndRemoveOnline:setAndRemoveOnline,
    validateEmail:validateEmail

}// end exports