/**
 * modules dependencies.
 */
const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const moment = require('moment')

const tokenLib = require("./tokenLib.js");
const check = require("./checkLib.js");
const response = require('./responseLib')
const userController = require('../controllers/userController')
const slotManager = require("./../controllers/slotManageController");
const slotModel = mongoose.model('MeetingPlanners');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
var meetingList = [];
var count = 1;
let setServer = (server) => {


    let allOnlineUsers = []

    let io = socketio.listen(server);
    let myIo = io.of('/')

    myIo.on('connection', (socket) => {

        console.log("on connection--emitting verify user");

        socket.emit("verifyUser", "");

        // code to verify the user and make him online

        socket.on('set-user', (authToken) => {

            console.log("set-user called")
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else {

                    console.log("user is verified..setting details");
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log(`${fullName} is online`);


                    let userObj = { userId: currentUser.userId, fullName: fullName, online: true }
                    allOnlineUsers.push(userObj)
                    console.log(allOnlineUsers)

                    // setting room name
                    // socket.room = 'meetUP'
                    // joining chat-group room.
                    //socket.join(socket.room)
                    socket.broadcast.emit('online-user-list', allOnlineUsers);

                    // userController.setAndRemoveOnline(allOnlineUsers)


                }


            })

        }) // end of listening set-user event


        socket.on('disconnect', () => {
            // disconnect the user from socket
            // remove the user from online list
            // unsubscribe the user from his own channel
            console.log("user is disconnected");
            // console.log(socket.connectorName);
            console.log(socket.userId);
            var removeIndex = allOnlineUsers.map(function (user) { return user.userId; }).indexOf(socket.userId);

            allOnlineUsers.splice(removeIndex, 1)
            // let userObj = {userId:socket.userId,fullName:socket.fullName,online:false}
            // allOnlineUsers.push(userObj)

            console.log(allOnlineUsers)

            socket.broadcast.emit('online-user-list', allOnlineUsers);
            // userController.setAndRemoveOnline(allOnlineUsers)

            // socket.leave(socket.room)
        }) // end of on disconnect

        socket.on('updates', (data) => {
            // console.log(data);
            console.log("notify user")
            console.log(data)
            socket.broadcast.emit(data.participantEmail, data);
        });


        var reminderList = [];

        function sendRemainder() {

            reminderList = [];
            //meeting List

            slotModel.find({ status: true, remainder: true })
                .select('-_id -_v')
                .exec((err, meetingDetails) => {
                    if (err) {
                        meetingList = []
                    } else if (check.isEmpty(meetingDetails)) {
                        meetingList = []
                    } else {
                        // console.log("data")
                        meetingList = meetingDetails

                    }
                })




            if (typeof meetingList != 'undefined' && meetingList.length > 0) {
                reminderList = [];
                meetingList.forEach(function (meeting) {
                    if (meeting.meetingStartDate) {
                        if (moment().diff(meeting.meetingStartDate, 'minutes') >= -5 && moment().diff(meeting.meetingStartDate, 'minutes') <= 0) {
                            reminderList.push(meeting)
                        }
                    }
                });
            }

            // socket.on('remainder', (reminderList) => {
            //console.log("Remainder")

            // })


        }
        //sendRemainder();
        // setInterval(sendRemainder, 10000);

        var minutes = 1, the_interval = minutes * 60 * 1000;
        if (count == 1) {


            setInterval(function () {
                //console.log("I am doing my 5 minutes check");
                console.log(minutes)
                minutes = minutes + 1;
                reminderList = []
                sendRemainder();
                if (reminderList.length != 0) {
                    socket.broadcast.emit("remainder-list", reminderList);
                    reminderList =[]
                }
                // do your stuff here
            }, 60000);

            count++;
        }

    });

}




module.exports = {
    setServer: setServer
}
