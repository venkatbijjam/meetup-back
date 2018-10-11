const express = require('express');
const router = express.Router();
const slotManager = require("./../../app/controllers/slotManageController");
const appConfig = require("./../../configs/appConfig")
const auth = require('./../middlewares/adminCheck')
const authSign = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/slot`;

    // params:
    app.post(`${baseUrl}/createMeeting`, auth.isAdmin, slotManager.createMeeting);
    /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/slot/createMeeting api for creating Meeting.
     *
     * @apiParam {string} email email of the host. (body params) (required)
     * @apiParam {string} participentemail participentemail of meeting. (body params) (required)
     * @apiParam {string} meetingSubject  meetingSubject   of the meeting. (body params) (required)
     * @apiParam {string} meetingDetails meetingDetails  of the meetingDetails. (body params) (required)
     * @apiParam {string} location location of the meeting. (body params) (optional)
     * @apiParam {date} meetingStartDate meetingStartDate of the meeting. (body params) (required)
     * @apiParam {date} meetingEndDate meetingEndDate of the meeting. (body params) (required)
    * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Meeting is Scheduled",
            "status": 200,
            "data": "Mail has send to participates"
        }
    */
    // params: 
    app.post(`${baseUrl}/updateMeeting`, authSign.isAuthorized, slotManager.updateMeeting);
    /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/slot/updateMeeting api for udpate meeting.
     *
     * @apiParam {string} meetingId meetingId of meeting. (body params) (required)
     * @apiParam {string} meetingSubject  meetingSubject   of the meeting. (body params) (optional)
     * @apiParam {string} meetingDetails meetingDetails  of the meetingDetails. (body params) (optional)
     * @apiParam {string} location location of the meeting. (body params) (optional)
     * @apiParam {date} meetingStartDate meetingStartDate of the meeting. (body params) (optional)
     * @apiParam {date} meetingEndDate meetingEndDate of the meeting. (body params) (optional)
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Meeting is Updated",
            "status": 200,
            "data": "Update Meeting Mail has send to participates"
        }
    */

   app.post(`${baseUrl}/dismissMeeting`, authSign.isAuthorized, slotManager.dismissMeeting);
   /**
    * @apiGroup Meeting
    * @apiVersion  1.0.0
    * @api {post} /api/v1/slot/dismissMeeting api for dismiss meeting.
    *
    * @apiParam {string} meetingId meetingId of meeting. (body params) (required)
    * @apiParam {string} meetingSubject  meetingSubject   of the meeting. (body params) (optional)
    * @apiParam {string} meetingDetails meetingDetails  of the meetingDetails. (body params) (optional)
    * @apiParam {string} location location of the meeting. (body params) (optional)
    * @apiParam {date} meetingStartDate meetingStartDate of the meeting. (body params) (optional)
    * @apiParam {date} meetingEndDate meetingEndDate of the meeting. (body params) (optional)
    * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

    *
    * @apiSuccess {object} myResponse shows error status, message, http status code, result.
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Meeting is Updated",
           "status": 200,
           "data": "Update Meeting Mail has send to participates"
       }
   */
    // params: meetingId
    app.post(`${baseUrl}/:meetingId/deleteMeeting`, authSign.isAuthorized, slotManager.deleteMeeting);

        /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/slot/:meetingId/deleteMeeting api for deleting meeting.
     *
     * @apiParam {string} meetingId meetingId of meeting. (body params) (required)
    * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Meeting is Deleted",
            "status": 200,
            "data": "Deletion Meeting Mail has send to participates"
        }
    */
    // params: 
    app.get(`${baseUrl}/allMeeting`, authSign.isAuthorized, slotManager.getAllMeetingDetails);

      /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/slot/allMeeting api for get all Meeting details.
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Meetings Found",
            "status": 200,
            "data": [
                {
                    "meetingId": "_OwTYJfHr",
                    "meetingSubject": "testing",
                    "hostId": "2vOoVxRS0",
                    "hostName": "Venkat Bijjam",
                    "hostEmail": "venkat33b@gmail.com",
                    "participentemail": "venkat33b@gmail.com",
                    "participentName": "Venkat Bijjam",
                    "participentId": "2vOoVxRS0",
                    "meetingDetails": "test",
                    "location": "test",
                    "meetingStartDate": "2018-09-12T17:57:50.382Z",
                    "meetingEndDate": "2018-09-12T17:57:50.382Z",
                    "modifiedOn": "2018-09-29T14:55:55.000Z"
                },
                {
                    "meetingId": "l2OoG_Ofh",
                    "meetingSubject": "testingupdated",
                    "hostId": "2vOoVxRS0",
                    "hostName": "Venkat Bijjam",
                    "hostEmail": "venkat33b@gmail.com",
                    "participentemail": "venkat33b@outlook.com",
                    "participentName": "Sai B",
                    "participentId": "DJazmIv_O",
                    "meetingDetails": "testupdated",
                    "location": "testupdated",
                    "meetingStartDate": "2018-09-12T17:57:50.382Z",
                    "meetingEndDate": "2018-09-12T17:57:50.382Z",
                    "modifiedOn": "2018-09-29T16:19:17.000Z"
                }
            ]
        }
    */
    // params: 

    app.get(`${baseUrl}/meetingById/:meetingId`,authSign.isAuthorized, slotManager.getMeetingDetailsByMeetingId);

      /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/slot/meetingById/:meetingId api for get meeting by Meeting Id.
     *
     * @apiParam {string} meetingId meetingId of meeting. (body params) (required)
    * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
       {
            "error": false,
            "message": "Meeting details found",
            "status": 200,
            "data": {
                "meetingId": "HFAyArFVp",
                "meetingSubject": "testing",
                "hostId": "WBTx20vnk",
                "hostName": "Venkat Bijjam",
                "hostEmail": "venkat33b@gmail.com",
                "participentemail": "venkat33b@gmail.com",
                "participentName": "Venkat Bijjam",
                "participentId": "WBTx20vnk",
                "meetingDetails": "",
                "location": "",
                "meetingStartDate": "2016-05-03T20:15:01.000Z",
                "meetingEndDate": "2016-05-03T20:15:01.000Z",
                "modifiedOn": "2018-09-30T19:00:17.000Z"
            }
        }
    */
    // params: 
    app.get(`${baseUrl}/MeetingByUser/:userId`,authSign.isAuthorized, slotManager.getMeetingDetaisByUser);

      /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/slot/MeetingByUser/:userId api for get meeting by participent user id.
     *
     * @apiParam {string} userId userId of meeting. (body params) (required)
     * @apiParam {string} authToken authToken of the user. (body/body/header params) (required)

     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Meeting details found",
            "status": 200,
            "data": {
                "meetingId": "HFAyArFVp",
                "meetingSubject": "testing",
                "hostId": "WBTx20vnk",
                "hostName": "Venkat Bijjam",
                "hostEmail": "venkat33b@gmail.com",
                "participentemail": "venkat33b@gmail.com",
                "participentName": "Venkat Bijjam",
                "participentId": "WBTx20vnk",
                "meetingDetails": "",
                "location": "",
                "meetingStartDate": "2016-05-03T20:15:01.000Z",
                "meetingEndDate": "2016-05-03T20:15:01.000Z",
                "modifiedOn": "2018-09-30T19:00:17.000Z"
            }
        }
    */
}
