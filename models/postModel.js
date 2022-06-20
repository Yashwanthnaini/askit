const mongoose = require('mongoose');
const Joi = require('joi'); 


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
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            }
        }),
            required: true
    },
    tags: {
        type: Array,
        lowercase: true
    },
    date: {
        type: Date, 
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);

function validatePost(post){
    const schema = Joi.object({
        title: Joi.string().min(5).max(255).required(),
        data: Joi.string().required(),
        tags: Joi.array().optional(),
    });
    return schema.validate(post);
}

function validatePostTitle(post){
    const schema = Joi.object({
        title: Joi.string().min(5).max(255).required()
    });
    return schema.validate(post);
}

function validatePostBody(post){
    const schema = Joi.object({
        data: Joi.string().required(),
    });
    return schema.validate(post);
}

module.exports.Post = Post;
module.exports.validatePost = validatePost;
module.exports.validatePostTitle = validatePostTitle;
module.exports.validatePostBody = validatePostBody;