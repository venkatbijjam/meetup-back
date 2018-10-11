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
const UserModel = mongoose.model('Users');
const AuthModel = mongoose.model('Auths');
const slotModel = mongoose.model('MeetingPlanners');
var remainderList=[];

//createMeeting
let createMeeting = (req, res) => {
    console.log("Validating Iput")

    //validating the user input
    let validateMeetingInput = () => {
        console.log("Validating Iput")

        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.email) ||
                check.isEmpty(req.body.participantEmail) ||
                check.isEmpty(req.body.meetingSubject) ||
                check.isEmpty(req.body.meetingStartDate) ||
                check.isEmpty(req.body.meetingEndDate)
            ) {
                logger.error('Field Missing During Meeting Creation', 'SlotManageController: validateMeetingInput()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) found is missing validate', 400, null)
                reject(apiResponse)
            }
            else {
                resolve(req);
            }
        });
    } // end of validate meeting inputs

    // validate host deatils

    let valdiateHostDetails = () => {

        return new Promise((resolve, reject) => {
            console.log("Validating valdiateHostDetails")

            if (!validateInput.Email(req.body.email)) {
                let apiResponse = response.generate(true, 'Invalid Host Email', 400, null)
                reject(apiResponse)
            } else {
                UserModel.findOne({ email: req.body.email.toLowerCase() }, (err, hostDetails) => {
                    if (err) {
                        logger.error('Error while retreving data from Database', 'SlotManageController: valdiateHostDetails()', 7)
                        let apiResponse = response.generate(true, 'Failed to retrive data from Database', 400, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(hostDetails)) {
                        logger.error('No details found with email', 'SlotManageController: valdiateHostDetails()', 5)
                        let apiResponse = response.generate(true, 'No details found with host email', 400, null)
                        reject(apiResponse)
                    }
                    else {
                        let hostBody = {
                            hostId: hostDetails.userId,
                            hostEmail: hostDetails.email,
                            hostName: hostDetails.firstName + " " + hostDetails.lastName
                        }
                        resolve(hostBody);

                    }
                });
            }
        })

    } // emd of validate host details

    // validating the participate details
    let validateParticipateDetails = (hostBody) => {
        console.log("Validating validateParticipateDetails")

        return new Promise((resolve, reject) => {
            if (!validateInput.Email(req.body.participantEmail)) {
                let apiResponse = response.generate(true, 'Invalid Participate Email', 400, null)
                reject(apiResponse)
            } else {
                UserModel.findOne({ email: req.body.participantEmail.toLowerCase() }, (err, participateDetails) => {
                    if (err) {
                        logger.error('Error while retreving data from Database', 'SlotManageController: validateParticipateDetails()', 7)
                        let apiResponse = response.generate(true, 'Failed to retrive data from Database', 400, null)
                        reject(apiResponse)
                    }
                    else if (check.isEmpty(participateDetails)) {
                        logger.error('No details found with email', 'SlotManageController: validateParticipateDetails()', 5)
                        let apiResponse = response.generate(true, 'No details found with participate email', 400, null)
                        reject(apiResponse)
                    }
                    else {
                        let responseBody = {

                            hostId: hostBody.hostId,
                            hostEmail: hostBody.hostEmail,
                            hostName: hostBody.hostName,
                            participateId: participateDetails.userId,
                            participateEmail: participateDetails.email,
                            participateName: participateDetails.firstName + " " + participateDetails.lastName
                        }

                        resolve(responseBody);

                    }
                });
            }
        })
    } // end of participate validation

    // save details to Database
    let saveDeatils = (responseBody) => {

        return new Promise((resolve, reject) => {
            let newMeeting = new slotModel({
                meetingId: shortid.generate(),
                meetingSubject: req.body.meetingSubject,
                hostId: responseBody.hostId,
                hostName: responseBody.hostName,
                hostEmail: responseBody.hostEmail,
                participentemail: responseBody.participateEmail,
                participentName: responseBody.participateName,
                participentId: responseBody.participateId,
                meetingDetails: req.body.meetingDetails || '',
                location: req.body.location || '',
                meetingStartDate: req.body.meetingStartDate,
                meetingEndDate: req.body.meetingEndDate,
                createdOn: time.now(),
                modifiedOn: time.now(),
                status: true

            })
            newMeeting.save((err, result) => {
                if (err) {
                    logger.error('Failed to load data to database', 'SlotManageController: saveDeatils()', 5)
                    let apiResponse = response.generate(true, 'Meeting is not saved to Database', 400, null)
                    reject(apiResponse)
                } else {
                    console.log("save details")
                    let retrivedDetails = result.toObject();
                    delete retrivedDetails._id
                    delete retrivedDetails.modifiedOn
                    resolve(retrivedDetails);
                }
            });
        })
    } // end of saving details to DB

    // send email to users
    let sendEmail = (retrivedDetails) => {
        return new Promise((resolve, reject) => {
            mailTemplete.meetingCreatedEmail(retrivedDetails, (err, mailOptions) => {
                if (err) {
                    logger.error(err.message, 'SlotManageController: sendEmail', 10)
                    let apiResponse = response.generate(true, 'Failed To Send an email', 500, null)
                    console.log(err)
                    reject(apiResponse)
                } else {
                    mail.sendingMails(mailOptions);
                    let apiResponse = "Mail has send to participates"
                    resolve(apiResponse)
                }
            });

        });
    } // end of sending email

    validateMeetingInput(req, res)
        .then(valdiateHostDetails)
        .then(validateParticipateDetails)
        .then(saveDeatils)
        .then(sendEmail)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting is Scheduled', 200, resolve);
            res.send(apiResponse);
        })

        .catch((err) => {
            res.send(err);
        })



} // end of create meeting function

//update meeting by Host

let updateMeeting = (req, res) => {

    //validating the user input
    let validateUpdatedMeeting = () => {
        return new Promise((resolve, reject) => {
            if (
               
                check.isEmpty(req.body.meetingSubject) ||
                check.isEmpty(req.body.meetingStartDate) ||
                check.isEmpty(req.body.meetingEndDate) ||
                check.isEmpty(req.body.meetingId)

            ) {
                logger.error('Field Missing During Meeting Creation', 'SlotManageController: validateMeetingInput()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) found is missing validate', 400, null)
                reject(apiResponse)
            }
            else {
                resolve(req);
            }
        });
    } // end of validate meeting inputs



    // save details to Database
    let updateDetails = (responseBody) => {

        return new Promise((resolve, reject) => {
            slotModel.findOne({ meetingId: req.body.meetingId }, (err, meetingDetails) => {
                if (err) {
                    logger.error('rror while retreving data from Database', 'SlotManageController: updateDetails()', 5)
                    let apiResponse = response.generate(true, 'Error while retreving data from Database', 400, null)
                    reject(apiResponse)
                }
                else if (check.isEmpty(meetingDetails)) {
                    logger.error('Meeting Details is not found to update', 'SlotManageController: updateDetails()', 5)
                    let apiResponse = response.generate(true, 'Meeting Details is not found to update', 400, null)
                    reject(apiResponse)
                }
                else {

                    meetingDetails.meetingSubject = req.body.meetingSubject;
                    meetingDetails.meetingDetails = req.body.meetingDetails || '';
                    meetingDetails.location = req.body.location || '';
                    meetingDetails.meetingStartDate = req.body.meetingStartDate;
                    meetingDetails.meetingEndDate = req.body.meetingEndDate;
                    meetingDetails.modifiedOn = time.now();
                    meetingDetails.remainder = req.body.remainder || true;
                    meetingDetails.save((err, result) => {
                        if (err) {
                            logger.error('Failed to Update', 'SlotManageController: updateDetails()', 5)
                            let apiResponse = response.generate(true, 'Unable to update details', 400, null)
                            reject(apiResponse)
                        } else {
                            resolve(result)
                        }
                    })
                }

            })
        })
    } // end of saving details to DB

    // send email to users
    let sendUpdateMeegingemail = (result) => {
        return new Promise((resolve, reject) => {
            mailTemplete.updateMeetingEmail(result, (err, mailOptions) => {
                if (err) {
                    logger.error(err.message, 'SlotManageController: sendUpdateMeegingemail', 10)
                    let apiResponse = response.generate(true, 'Failed To Send an email', 500, null)
                    console.log(err)
                    reject(apiResponse)
                } else {
                    console.log(mailOptions)
                    mail.sendingMails(mailOptions);
                    let apiResponse = "Update Meeting Mail has send to participates"
                    resolve(apiResponse)
                }
            });

        });
    } // end of sending email

    validateUpdatedMeeting(req, res)
        .then(updateDetails)
        .then(sendUpdateMeegingemail)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting is Updated', 200, resolve);
            res.send(apiResponse);
        })
        .catch((err) => {
            res.send(err);
        })
}// end of update meeting


let dismissMeeting =(req,res) =>{
    console.log(req.body)
    slotModel.findOne({ meetingId: req.body.meetingId }, (err, meetingDetails) => {
    
        if (err) {
            logger.error('error while retreving data from Database', 'SlotManageController: dismissMeeting()', 5)
            let apiResponse = response.generate(true, 'Error while retreving data from Database', 400, null)
            res.send(apiResponse)
        }
        else if (check.isEmpty(meetingDetails)) {
            logger.error('Meeting Details is not found to update', 'SlotManageController: dismissMeeting()', 5)
            let apiResponse = response.generate(true, 'Meeting Details is not found to update', 400, null)
            res.send(apiResponse)
            //reject(apiResponse)
        }
        else {

           
            meetingDetails.modifiedOn = time.now();
            meetingDetails.remainder = false;
            meetingDetails.save((err, result) => {
                if (err) {
                    logger.error('Failed to Update', 'SlotManageController: dismissMeeting()', 5)
                    let apiResponse = response.generate(true, 'Unable to update details', 400, null)
            res.send(apiResponse)
                   
                } else {
            res.send("Sucess")
                  
                }
            })
        }
    })
} // dismiss meeting

let sendMeetingRemainder =() =>{
    slotModel.find({ 'status': true, 'remainder': true })
    .select('-_id -_v')
    .exec((err, meetingDetails) => {
        if (err) {
            this.remainderList =[]
        } else if (check.isEmpty(meetingDetails)) {
            this.remainderList=[];
        } else {
          // console.log("data")
           this.remainderList= meetingDetails

        }
    })
}

//delete meeting

let deleteMeeting = (req, res) => {


    let findAndDelete = () => {
        return new Promise((resolve, reject) => {
            console.log("find function")
            slotModel.findOne({ meetingId: req.params.meetingId }, (err, meetingDetails) => {
                if (err) {
                    logger.error(err, 'SlotManageController: findAndDelete', 10)
                    let apiResponse = response.generate(true, 'Failed to connecting with Database', 500, null)
                    console.log(err)
                    reject(apiResponse)
                } else if (check.isEmpty(meetingDetails)) {
                    logger.error(err, 'SlotManageController: findAndDelete', 10)
                    let apiResponse = response.generate(true, 'No Meeting find with Inputed Meeting ID', 500, null)
                    console.log(err)
                    reject(apiResponse)
                } else  if(meetingDetails.status){
                    console.log(meetingDetails);
                    meetingDetails.status = false;
                    meetingDetails.modifiedOn = time.now();
                    meetingDetails.save((err, deleteddata) => {
                        if (err) {
                            logger.error(err, 'SlotManageController: findAndDelete', 10)
                            let apiResponse = response.generate(true, 'Failed to delete Meeting', 500, null)
                            console.log(err)
                            reject(apiResponse)
                        } else {
                            let result = {
                                meetingSubject: deleteddata.meetingSubject,
                                meetingHosted: deleteddata.hostName,
                                meetingParticupentEmail: deleteddata.participentemail,
                                meetingParticupentName : deleteddata.participentName 
                            }
                            resolve(result);
                        }
                    })
                } else{
                    let apiResponse = response.generate(true, 'Meeting is already deleted/Removed', 500, null);
                    reject (apiResponse)
                }
            })
        })
       


    }

     // send email to users
     let sendDeleteMessagingemail = (result) => {
        return new Promise((resolve, reject) => {
            mailTemplete.deleteMeetingEmail(result, (err, mailOptions) => {
                if (err) {
                    logger.error(err, 'SlotManageController: sendDeleteMessagingemail', 10)
                    let apiResponse = response.generate(true, 'Failed To Send an email', 500, null)
                    console.log(err)
                    reject(apiResponse)
                } else {
                    mail.sendingMails(mailOptions);
                    let apiResponse = "Deletion Meeting Mail has send to participates"
                    resolve(apiResponse)
                }
            });

        });
    } // end of sending email

    findAndDelete(req, res)
        .then(sendDeleteMessagingemail)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Meeting is Deleted', 200, resolve);
            res.send(apiResponse);
        })

        .catch((err) => {
            res.send(err);
        })
} // end of delete meeting


// getAllMeeting Details
let getAllMeetingDetails = (req,res) => {

    slotModel.find({status:true})
            .select('-_id -__v -createdOn -createdOn -status')
            .exec((err,allMeetingDetails) =>{
                if(err){
                    logger.error(err, 'SlotManageController: getAllMeetingDetails', 10)
                    let apiResponse = response.generate(true, 'Failed to retrive details from DB', 500, null)
                    res.send(apiResponse)

                }
                else if(check.isEmpty(allMeetingDetails)){
                    let apiResponse = response.generate(true, 'No Meeting Found', 500, null)
                   res.send(apiResponse)
                } else{
                    let apiResponse = response.generate(false, 'Meetings Found', 200, allMeetingDetails)
                    
                    res.send(apiResponse)
                }
            })
} // end of all meetingDetail Function



//get Meeting Details by User

let getMeetingDetaisByMeetingId = (req,res) => {
        console.log("meeting by id", req.params.meetingId)
        slotModel.findOne({$and : [{meetingId: req.params.meetingId} ,{ status:true }]},(err,result) =>{
            if(err){
                logger.error(err, 'SlotManageController: getMeetingDetaisByUserId', 10)
                let apiResponse = response.generate(true, 'Failed to retrive details from DB', 500, null)
                res.send(apiResponse)
            }else if(check.isEmpty(result)){
                let apiResponse = response.generate(true, 'No Meeting Found', 500, null)
                res.send(apiResponse)
           
            } else{
                let meetingDetails = result.toObject();
                delete meetingDetails._id
                delete meetingDetails.__v
                delete meetingDetails.createdOn
                delete meetingDetails.status
                let apiResponse = response.generate(false, 'Meeting details found', 200, meetingDetails)

                res.send(apiResponse)
            }
        })

}// end of meeting details by user function

let getMeetingDetailsByUserId = (req,res) => {

    slotModel.find({$and : [{participentId: req.params.userId} ,{ status:true }]})
    . select('-_id -__v -createdOn -createdOn -status')
    .exec((err,result) =>{
        if(err){
            logger.error(err, 'SlotManageController: getMeetingDetailsByUserId', 10)
            let apiResponse = response.generate(true, 'Failed to retrive details from DB', 500, null)
            res.send(apiResponse)
        }else if(check.isEmpty(result)){
            let apiResponse = response.generate(false, 'No Meeting Found', 400, null)
            res.send(apiResponse)
       
        } else{
           
            let apiResponse = response.generate(false, 'Meeting details found', 200, result)

            res.send(apiResponse)
        }
    })

} // end of Meeting Details by Meeting ID


module.exports = {
    createMeeting: createMeeting,
    updateMeeting: updateMeeting,
    deleteMeeting: deleteMeeting,
    getAllMeetingDetails: getAllMeetingDetails,
    getMeetingDetaisByUser: getMeetingDetailsByUserId,
    getMeetingDetailsByMeetingId: getMeetingDetaisByMeetingId,
    sendMeetingRemainder:sendMeetingRemainder,
    remainderList:remainderList,
    dismissMeeting:dismissMeeting
}