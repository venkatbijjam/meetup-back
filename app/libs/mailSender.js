'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing



let sendingMails = (mailOptions) =>{

    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
     

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
               // user: account.user, // generated ethereal user
               // pass: account.pass // generated ethereal password
                user: 'meetuptesting123@gmail.com',
                pass: 'meetup@123'
            }
        });
            


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
    });
    


}



/**
 * exporting functions.
 */
module.exports = {
    sendingMails: sendingMails
}

