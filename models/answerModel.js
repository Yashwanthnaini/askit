const mongoose = require("mongoose");
const Joi = require('joi');

const answerSchema = new mongoose.Schema({
    answer: {
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
    question: {
        type: new mongoose.Schema({
            author_id:{
                type: mongoose.Schema.Types.ObjectId
            }
        }),
        required: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    }
});
const Answer = mongoose.model("Answer", answerSchema);

function validateAnswer(answer){
    const schema = Joi.object({
        answer : Joi.string().min(1).required(),
        questionId : Joi.objectId().required(),
    });
    return schema.validate(answer);
}

module.exports.answerSchema = answerSchema;
module.exports.Answer= Answer;
module.exports.validateAnswer = validateAnswer;