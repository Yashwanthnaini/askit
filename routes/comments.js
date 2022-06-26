const {Comment,validateComment} = require("../models/commentModel");
const auth = require("../middleware/authorization");
const admin = require("../middleware/admin");
const {User} = require("../models/userModel");
const {Notification} = require("../models/notificationModel");
const {Post} = require("../models/postModel");
const {Question} = require("../models/questionModel");
const {Answer} = require("../models/answerModel");
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
                _id: req.body.postId,
                author_id:post.author._id
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

router.put ("/update/:id", auth, async (req, res) => {
    try{
        const {error} = validateComment(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).send("The comment with the given ID was not found.");

        if(comment.author._id != req.user._id){
            return res.status(401).send("access denied.");
        }
        
        await Comment.findByIdAndUpdate(req.params.id, {
            comment: req.body.comment
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
    const comment = await Comment.findById(req.params.id);

    if(!comment) return res.status(400).send("The comment with the given ID was not found.");

    if(comment.author._id != req.user._id){
        return res.status(401).send("access denied.");
    }
    await Comment.findByIdAndRemove(req.params.id);
    res.send("comment deleted");
});

//admin privlagues

router.put ("/admin/update/:id", admin, async (req, res) => {
    try{
        const {error} = validateComment(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).send("The comment with the given ID was not found.");
        
        await Comment.findByIdAndUpdate(req.params.id, {
            comment: req.body.comment
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
    const comment = await Comment.findByIdAndRemove(req.params.id);
    if (!comment) return res.status(404).json({
        error : "The comment with the given ID was not found."
    });
    res.json({
        message : "comment deleted successfully"
    });
})

module.exports = router;