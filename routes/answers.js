const {Answer, validateAnswer } = require("../models/answerModel");
const {Question} = require("../models/questionModel");
const auth = require("../middleware/authorization");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();


router.post("/add", auth, async (req,res) => {
    try{
        const {error} = validateAnswer(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const question = await Question.findById(req.body.questionId);
        if(!question) return res.status(400).send("Invalid Question");

        const answer = new Answer ({
            answer: req.body.answer,
            author:{
                _id: user._id,
                name : user.name
            },
            question:{
                _id: req.body.questionId
            }
        })
        await answer.save();
        const notification = new Notification ({
            notification : `${user.name} answered to your question ${question.title}`,
            user : {
                _id : question.author._id
            },
            link : `https://askito.herokuapp.com/api/questions/${question._id}`
        })
        await notification.save();
        res.json({
            message : "answer updated successfully"
        })
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }


})

module.exports = router;