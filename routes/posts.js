const {Post,validatePost} = require("../models/postModel");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();

router.post("/add", async(req, res)=>{
    try{
        const {error} = validatePost(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const user = await User.findById(req.body.userId);
        if (!user) return res.status(400).send("Invalid user.");

        const post = new Post({
            title: req.body.title,
            author: {
                _id: user._id,
                name: user.name
            },
            data : req.body.data,
            tags:[req.body.tags],
            comments:[req.body.comments]
        });
        await post.save();
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

module.exports = router;