const {Answer, validateAnswer } = require("../models/answerModel");
const {Question} = require("../models/questionModel");
const {Notification} = require("../models/notificationModel");
const admin = require("../middleware/admin");
const sendEmail = require("../resources/mailer");
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
                _id: req.body.questionId,
                author_id : question.author._id
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
        const token = question._id;
        await sendEmail(question.author.email, token, user.name, "answer");
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


router.put ("/update/:id", auth, async (req, res) => {
    try{
        const {error} = validateAnswer(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).send("The answer with the given ID was not found.");

        if(answer.author._id != req.user._id){
            return res.status(401).send("access denied.");
        }
        
        await Answer.findByIdAndUpdate(req.params.id, {
            answer: req.body.answer 
        }, {new: true});
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})

router.put ("/update/iscorrect/:id", auth, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).send("The answer with the given ID was not found.");

        if(answer.question.author_id != req.user._id){
            return res.status(401).send("access denied.");
        }
        
        await Answer.findByIdAndUpdate(req.params.id, {
            isCorrect : true
        }, {new: true});
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})

router.delete("/delete/:id", auth, async (req, res) => {
    const answer = await Answer.findById(req.params.id);

    if(!answer) return res.status(400).send("The Answer with the given ID was not found.");

    if(answer.author._id != req.user._id){
        return res.status(401).send("access denied.");
    }
    await Answer.findByIdAndRemove(req.params.id);
    res.send("Answer deleted");
});

//admin previlages

router.put ("/admin/update/:id", admin, async (req, res) => {
    try{
        const {error} = validateAnswer(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).send("The answer with the given ID was not found.");
        
        await Answer.findByIdAndUpdate(req.params.id, {
            answer: req.body.answer 
        }, {new: true});
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})


router.put("/admin/update/iscorrect/:id", admin, async (req, res) => {
    try{

        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).send("The answer with the given ID was not found.");

        await Answer.findByIdAndUpdate(req.params.id, {
            isCorrect : true
        }, {new: true});
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})



router.delete("/admin/delete/:id" ,admin, async (req, res)=> {
    const answer = await Answer.findByIdAndRemove(req.params.id);
    if (!answer) return res.status(404).json({
        error : "The Answer with the given ID was not found."
    });
    res.json({
        message : "answer deleted successfully"
    });
})


module.exports = router;