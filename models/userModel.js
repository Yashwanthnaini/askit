
const jwt =require ("jsonwebtoken");
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        minlength: 7,
        maxlength: 255,
        unique: true,
        trim: true
    },
    password:{
        type: String,
        minlength: 5,
        maxlength: 1024,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id , isAdmin : this.isAdmin}, process.env.TOKEN_SECRET);
    return token;
}


userSchema.methods.generateVerifyToken = function(){
    const token = jwt.sign({_id: this._id , isAdmin : this.isAdmin}, process.env.VERIFY_TOKEN_SECRET);
    return token;
}

userSchema.methods.generateResetToken = function(){
    const token = jwt.sign({_id: this._id , isAdmin : this.isAdmin}, process.env.RESET_TOKEN_SECRET,{ expiresIn: '10m'});
    return token;
}

const User = mongoose.model('User', userSchema );

function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(user);
}


function validateLogin(user){
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser= validateUser;
module.exports.validateLogin= validateLogin;