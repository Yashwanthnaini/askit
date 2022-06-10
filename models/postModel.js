const mongoose = require('mongoose');
const Joi = require('joi');
const {userSchema} = require("./userModel"); 


const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    data: {
        type: String,
        requied: true
    },
    author: {
        type: userSchema,
        required: true
    },
    tags: {
        type: Array,
        lowercase: true
    },
    date: {
        type: Date, 
        default: Date.now
    },
    comments: {
        type: Array
    }
});

const Post = mongoose.model('Post', postSchema);

function validatePost(post){
    const schema = Joi.object({
        title: Joi.string().min(5).max(255).required(),
        data: Joi.string().required()
    });
    return schema.validate(post);
}

module.exports.Post = Post;
module.exports.validatePost = validatePost;