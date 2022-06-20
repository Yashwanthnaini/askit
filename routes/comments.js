const {Comment,validateComment} = require("../models/commentModel");
const auth = require("../middleware/authorization");
const {User} = require("../models/userModel");
const {Notification} = require("../models/notificationModel");
const {Post} = require("../models/postModel");
const express = require("express");
const router = express.Router();


router.post("/add", auth, async (req,res) => {
    try{
        const {error} = validateComment(req.body);
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
        else {
            post = await Answer.findById(req.body.PostId);
        }
        
        if(!post) return res.status(400).send(`invalid ${req.body.type}`);

        const comment = new Comment ({
            comment: req.body.comment,
            author:{
                _id: user._id,
                name : user.name
            },
            post:{
                _id: req.body.postId
            }
        })
        await comment.save();
        const notification = new Notification ({
            notification : `${user.name} commented on your ${req.body.type} about ${post.title}`,
            user : {
                _id : post.author._id
            },
            link : `https://askito.herokuapp.com/api/${req.body.type}s/get/${post._id}`
        })
        await notification.save();
        res.json({
            message : "comment updated successfully"
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