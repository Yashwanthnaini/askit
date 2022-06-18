const mongoose = require("mongoose");
const Joi = require('joi');

const notificationSchema = new mongoose.Schema({
    notification: {
        type : String,
        required : true
    },
    link: {
        type : String
    },
    isNoticied: {
        type : Boolean,
        default : false
    },
    user:{
        type : new mongoose.Schema({
        }),
        required : true
    },
    date: {
        type: Date, 
        default: Date.now
    }
    
});
const Notification = mongoose.model("Notification", notificationSchema);

function validateNotification(notification){
    const schema = Joi.object({
        notification : Joi.string().min(1).required()
    });
    return schema.validate(notification);
}

module.exports.notificationSchema = notificationSchema;
module.exports.Notification= Notification;
module.exports.validateNotification = validateNotification;