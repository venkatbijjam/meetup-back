const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../configs/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.


    // params: firstName, lastName, email, mobileNumber, password, userName, admin
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/singup api for user signup.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} firstName firstName  of the user. (body params) (required)
     * @apiParam {string} lastName lastName  of the user. (body params) (required)
     * @apiParam {string} mobileNumber mobileNumber of the user. (body params) (required)
     * @apiParam {string} admin admin of the user. (body params) (required)
     * @apiParam {string} userName userName of the user. (body params) (required)
     
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User profile is created",
            "status": 200,
            "data": {
                    "userId": "LMTz2Q89j",
                    "firstName": "Sai",
                    "lastName": "B",
                    "userName": "Myname",
                    "email": "venkat33b@outlook.com",
                    "mobileNumber": 9999999999,
                    "admin": false
            }
        }
    */

    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login to login user.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
            {
                "error": false,
                "message": "Login Successful",
                "status": 200,
                "data": {
                "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IjE5aTA1Y1VfMCIsImlhdCI6MTUzODMzMTU0MTE0MCwiZXhwIjoxNTM4NDE3OTQxLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7InVzZXJJZCI6IldCVHgyMHZuayIsImZpcnN0TmFtZSI6IlZlbmthdCIsImxhc3ROYW1lIjoiQmlqamFtIiwidXNlck5hbWUiOiJNeW5hbWUiLCJlbWFpbCI6InZlbmthdDMzYkBnbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOjk5OTk5OTk5OTksInJlc2V0UGFzc3dvcmRUb2tlbiI6IiIsInJlc2V0UGFzc3dvcmRFeHBpcmVzIjpudWxsLCJhZG1pbiI6ZmFsc2UsInN0YXR1cyI6dHJ1ZX19.e65diBl4Km4NAlcqxofwoonQMv56Vnkoc7Q6qTBsQTg",
                "userDetails": {
                    "userId": "WBTx20vnk",
                    "firstName": "Venkat",
                    "lastName": "Bijjam",
                    "userName": "Myname",
                    "email": "venkat33b@gmail.com",
                    "mobileNumber": 9999999999,
                    "resetPasswordToken": "",
                    "resetPasswordExpires": null,
                    "admin": false,
                    "status": true
                    }       
                }
            }
    */

    //  params: auth token, userId.
    app.post(`${baseUrl}/logout`, auth.isAuthorized,userController.logout);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/:userId/logout api to logout from application.
     *
     * @apiParam {string} userId userId of the user. (query params) (required)
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null
        }
    */
    // params: email, authToken
    app.post(`${baseUrl}/resetPassword`, userController.reestPassword);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/resetPassword api to reset mail link from application.
     *
     * @apiParam {string} email email of the user. (query params) (required)
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Send Mail Successfully",
            "status": 200,
            "data": {
                "email": "venkat33b@gmail.com",
                "expiryDate": "2018-10-01T18:29:15.000Z"
            }
        }
    */

    // params: email, oldPassword, password, authToken
    app.post(`${baseUrl}/checkPasswordUpdate`,auth.isAuthorized, userController.changePassword);

     /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/resetPassword api to update password from application.
     *
 
      * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} oldPassword oldPassword of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
            {
            "error": false,
            "message": "Password updated Sucessfully",
            "status": 200,
            "data": {
                "email": "venkat33b@gmail.com"
                }
            }
    */

    // params: email, password, authToken
    app.post(`${baseUrl}/resetPasswordUpdate`, userController.checkPasswordReset);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/resetPassword api to reset password from mail link from application.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
       {
            "error": false,
            "message": "Password Reset Sucessfully",
            "status": 200,
            "data": {
                "email": "venkat33b@gmail.com"
            }
        }
    */

    // params: authToken
    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/view/all api to get all users details from application.
     *
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
       {
            "error": false,
            "message": "All User Details Found",
            "status": 200,
            "data": [
                {
                    "userId": "LMTz2Q89j",
                    "firstName": "Sai",
                    "lastName": "B",
                    "userName": "Myname",
                    "password": "$2a$10$UD6oceAGCokZGqVPHyrpIezZmLgC/Ps1yr2kmxxsKpYEWFEher5Ce",
                    "email": "venkat33b@outlook.com",
                    "mobileNumber": 9999999999,
                    "resetPasswordToken": "",
                    "resetPasswordExpires": null,
                    "admin": false,
                    "createdOn": "2018-09-30T18:14:40.000Z",
                    "status": true
                }
            ]
        }
    */
    // params: userId, authToken
    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getSingleUser);

     /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/view/all api to get single users details from application.
     *
     * @apiParam {string} userId userId of the user. (params) (required) 
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
       {
            "error": false,
            "message": "All User Details Found",
            "status": 200,
            "data": [
                {
                    "userId": "LMTz2Q89j",
                    "firstName": "Sai",
                    "lastName": "B",
                    "userName": "Myname",
                    "password": "$2a$10$UD6oceAGCokZGqVPHyrpIezZmLgC/Ps1yr2kmxxsKpYEWFEher5Ce",
                    "email": "venkat33b@outlook.com",
                    "mobileNumber": 9999999999,
                    "resetPasswordToken": "",
                    "resetPasswordExpires": null,
                    "admin": false,
                    "createdOn": "2018-09-30T18:14:40.000Z",
                    "status": true
                }
            ]
        }
    */

    // params: userId, authToken, firstName, lastName, mobileNumber
    app.put(`${baseUrl}/:userId/edit`, auth.isAuthorized, userController.editUser);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/singup api for edit user details from applicaiton.
     *
     * @apiParam {string} userId userId of the user. (params) (required)
     * @apiParam {string} authToken authToken of the user. (query/body/header params) (required)
     * @apiParam {string} firstName firstName  of the user. (body params) (optional)
     * @apiParam {string} lastName lastName  of the user. (body params) (optional)
     * @apiParam {string} mobileNumber mobileNumber of the user. (body params) (optional)
     
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User details edited",
            "status": 200,
            "data": "null"
        }
    */

    //params: userId, authToken
    app.post(`${baseUrl}/:userId/delete`, auth.isAuthorized, userController.deleteUser);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/view/all api to delete users details from application.
     *
     * @apiParam {string} userId userId of the user. (params) (required) 
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
       {
            "error": false,
            "message": "Deleted the user successfully",
            "status": 200,
            "data": {
                "userId": "LMTz2Q89j",
                "firstName": "Sai",
                "lastName": "B",
                "userName": "Myname",
                "password": "$2a$10$UD6oceAGCokZGqVPHyrpIezZmLgC/Ps1yr2kmxxsKpYEWFEher5Ce",
                "email": "venkat33b@outlook.com",
                "mobileNumber": 9999999999,
                "resetPasswordToken": "",
                "resetPasswordExpires": null,
                "admin": false,
                "createdOn": "2018-09-30T18:14:40.000Z",
                "status": true,
                "_id": "5bb11290a966cb14ae441be6",
                "__v": 0
            }
        }
    */

   app.post(`${baseUrl}/:userId/validate`,userController.validateEmail);

}
