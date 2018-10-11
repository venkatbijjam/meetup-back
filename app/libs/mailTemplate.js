'use srict'
const moment = require('moment')
const momenttz = require('moment-timezone')
const timeZone = 'Asia/Calcutta'

const applicationUrl = 'http://meetup.venkatbijjam.in/user';


// welcome mail 
let welcomeMail = (email,userName,_id) =>{
    let mailDetails ={
    subject:'Welcome to Meeting Planner!',
    to: email, // list of receivers
    text:'',
    html :`
    <h2>Thanks for Registering with Meeting Planeer</h2>
    <br>
    Your User Name for login is: <b>`+ userName +`</b>
    please validate email with on click on below: 
    <br> <a href="${applicationUrl}/validateEmail/${_id}">Click Here</a>                                     
                                    
    <br>
    <br>
    <br>
    Thanks,<br>
    Meeting Planner Team
    `
    
    };

    return mailDetails;
} // end of welcome for new users

// mail formet for reset password
let recentPasswordMail =(result,callback) =>{

        try{
            let mailDetails ={
                subject:'Password Reset lik!!',
                to: result.email, // list of receivers
                text:'',
                html :`
                <h2>Please find reset Password link</h2>

                <br>
                <br> <a href="${applicationUrl}/${result.email}/resetPassword/${result.resetPasswordToken}">Click Here</a>                                 

                <br>
                Expire on <h3> `+ result.resetPasswordExpires+`</h3>
                <br>
                <br>
                Thanks,<br>
                Meeting Planner Team
                `
                
                };

                callback(null,mailDetails)
        }
        catch(err){
        callback(err, null);

        }
}; // emd of reset poassword email


// mail formet for update password
let updatePassword =(updateddetails,callback) =>{

    try{
        let mailDetails ={
            subject:'Password Updated !!',
            to: updateddetails.email, // list of receivers
            text:'',
            html :`
            <h2>Your Password is updated</h2>

            <br>
            <br>
            Thanks,<br>
            Meeting Planner Team
            `
            
            };

            callback(null,mailDetails)
    }
    catch(err){
    callback(err, null);

    }
}; // emd of reset poassword email



// mail for meeting invite creations
let meetingCreatedEmail = (retrivedDetails,callback) =>{
    try{
        let mailDetails ={
            subject:`Meeting Scheduled by  ${retrivedDetails.hostName} on ${retrivedDetails.meetingSubject}`,
            to: retrivedDetails.participentemail, // list of receivers
            text:'',
            html :`
            <h3>New Meeting is scheduled, Please find Meeting Details below</h3>
            <br>
           Meeting Start Date: ${moment(retrivedDetails.meetingStartDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}
            <br>
            Meeting End Date:${moment(retrivedDetails.meetingEndDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}
            <br>
            Location : ${retrivedDetails.location}
            <br>
            Meeting Details: ${retrivedDetails.meetingDetails} <br>
            <br>
            Thanks,<br>
            Meeting Planner Team
            `
            
            };

            callback(null,mailDetails)
    }
    catch(err){
    callback(err, null);

    }
} // mail to notify meeting is created




// mail for Update meeting info
let updateMeetingEmail = (result,callback) =>{
    try{
        let mailDetails ={
            subject:`Meeting Details Updated by ${result.hostName} on ${result.meetingSubject}`,
            to: result.participentemail, // list of receivers
            text:'',
            html :`

            <h3>Updated Meeting Details below</h3>
            <br>
           Meeting Start Date: ${moment(result.meetingStartDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}
            <br>
            Meeting End Date:${moment(result.meetingEndDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}
            <br>
            Location : ${result.location}
            <br>
            Meeting Details: ${result.meetingDetails} 
            <br>
            <br>
            Thanks,<br>
            Meeting Planner Team
            `
            
            };

            callback(null,mailDetails)
    }
    catch(err){
    callback(err, null);

    }
} // mail to notify update meeting info




// mail for Update meeting info
let deleteMeetingEmail = (result,callback) =>{
    try{
        let mailDetails ={
            subject:`Meeting has Deleted  by ${result.meetingHosted} on ${result.meetingSubject}`,
            to: result.meetingParticupentEmail, 
            text:'',
            html :`
            Hi ${result.meetingParticupentName},
            <br>
            Scheduled meeting has cancelled.  
            <br>
            <br>
            Thanks,<br>
            Meeting Planner Team
            `
            
            };

            callback(null,mailDetails)
    }
    catch(err){
    callback(err, null);

    }
} // mail to notify update meeting info
/**
 * exporting functions.
 */
module.exports = {
    welcomeMail: welcomeMail,
    recentPasswordMail:recentPasswordMail,
    meetingCreatedEmail:meetingCreatedEmail,
    updateMeetingEmail:updateMeetingEmail,
    deleteMeetingEmail:deleteMeetingEmail,
    updatePassword:updatePassword
}
