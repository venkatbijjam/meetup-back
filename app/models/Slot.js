'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let meetingSchema = new Schema({
  meetingId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  meetingSubject: {
    type: String,
    default: ''
  },
  hostId: {
    type: String,
    default: ''
  },
  hostName :{
    type: String,
    default:''
  },
  hostEmail: {
    type: String,
    default:''
  },
  participentemail: {
    type: String,
    default: ''
  },
  participentName: {
    type: String,
    default: ''
  },
  participentId: {
    type: String,
    default:''
  },
  meetingDetails: {
    type: String,
    default:''
  },
  location:{
  type:String,
  default:''
  },
  meetingStartDate :{
    type:Date,
    default:''
  },
  meetingEndDate :{
    type:Date,
    default:''
  },
  createdOn :{
    type:Date,
    default:''
  },
  modifiedOn :{
    type:Date,
    default: ''
  },
  status:{
    type: Boolean,
    default:true
  },
  remainder:{
    type: Boolean,
    default : true
  }



})


mongoose.model('MeetingPlanners', meetingSchema);