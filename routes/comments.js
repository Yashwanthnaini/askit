const {Comment,validateComment} = require("../models/commentModel");
const auth = require("../middleware/authorization");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();


router.post("/add", auth, async (req,res) => {
    try{
        const {error} = validateComment(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

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