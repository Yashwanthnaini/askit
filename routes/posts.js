const {Post,validatePost} = require("../models/postModel");
const auth = require("../middleware/authorization");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();

router.get("/:pagesize/:pagenum", async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const posts = await Post
                            .find()
                            .sort("date")
                            .select("-author._id __v")
                            .skip(pagenum-1*pagesize)
                            .limit(pagesize);
        res.send({posts});                    
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.get("/my/posts")

router.post("/add", auth, async(req, res)=>{
    try{
        const {error} = validatePost(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        if(!req.user.isVerified){
            return res.json({
                error: "verify your email first"
            })
        }
        const user = await User.findById(req.user._id);
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