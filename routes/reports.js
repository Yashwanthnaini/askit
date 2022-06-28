const {Report,validateReport} = require("../models/reportModel");
const auth = require("../middleware/authorization");
const admin = require("../middleware/admin");
const {User} = require("../models/userModel");
const {Notification} = require("../models/notificationModel");
const {Post} = require("../models/postModel");
const {Question} = require("../models/questionModel");
const sendCommentEmail = require("../resources/commentMail");
const {Answer} = require("../models/answerModel");
const express = require("express");
const router = express.Router();


router.post("/add", auth, async (req,res) => {
    try{
        const {error} = validateReport(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        let post ;

        if(req.body.type==="post"){
            post = await Post.findById(req.body.postId);
        }
        else if (req.body.type==="question"){
            post = await Question.findById(req.body.postId);
        }
        else if (req.body.type==="comment"){
            post = await Comment.findById(req.body.postId);
        }
        else {
            post = await Answer.findById(req.body.PostId);
        }
        
        if(!post) return res.status(400).send(`invalid ${req.body.type}`);

        const report = new Report ({
            report: req.body.report,
            author:{
                _id: user._id,
                name : user.name,
                email : user.email
            },
            post:{
                _id: req.body.postId,
                author_id:post.author._id
            }, 
            type: req.body.type
        })
        await report.save();
        res.json({
            message : "report updated successfully"
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