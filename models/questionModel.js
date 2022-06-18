const mongoose = require('mongoose');
const Joi = require('joi'); 


const questionSchema = new mongoose.Schema({
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

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(question){
    const schema = Joi.object({
        title: Joi.string().min(5).max(255).required(),
        data: Joi.string().required(),
        tags: Joi.array().optional(),
    });
    return schema.validate(question);
}

module.exports.Question = Question;
module.exports.validateQuestion = validateQuestion;