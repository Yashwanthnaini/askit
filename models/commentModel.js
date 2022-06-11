const mongoose = require("mongoose");
const Joi = require('joi');

const commentSchema = new mongoose.Schema({
    comment: {
        type : String,
        required : true
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
    post: {
        type: new mongoose.Schema({
            
        }),
        required: true
    }
});
const Comment = mongoose.model("Comment", commentSchema);

function validateComment(comment){
    const schema = Joi.object({
        comment : Joi.string().min(1).required(),
        postId : Joi.objectId().required(),
    });
    return schema.validate(comment);
}

module.exports.commentSchema = commentSchema;
module.exports.Comment= Comment;
module.exports.validateComment = validateComment;