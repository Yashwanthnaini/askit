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
        if(!posts){
            return res.json({
                message : "No posts found"
            })
        }
        res.json({
            posts : posts,
            totalPosts : posts.length
        });                    
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});


router.get("/myposts/:pagesize/:pagenum", auth, async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const posts = await Post
                            .find()
                            .sort("date")
                            .select("-author._id __v")
                            .skip(pagenum-1*pagesize)
                            .limit(pagesize);
        if(!posts){
            return res.json({
                message : "No posts found",
                totalPosts : 0
            })
        }
        res.json({
            posts : posts,
            totalPosts : posts.length
        });                    
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.post("/add", auth, async(req, res)=>{
    try{
        const {error} = validatePost(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const post = new Post({
            title: req.body.title,
            author: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            data : req.body.data,
            tags:[req.body.tags],
            comments:[req.body.comments]
        });
        await post.save();
        res.json({
            message : "post created successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.put("/:id", auth, async (req, res) => {
    try{
        const {error} = validatePost(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const post = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            author: {
                _id: user._id,
                name: user.name
            },
            data : req.body.data,
            tags:[req.body.tags],
            comments:[req.body.comments]
        }, {new: true});
        if (!post) return res.status(404).send("The movie with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.delete("/:id", auth, async (req, res) => {
    const post = await Post.findByIdAndRemove(req.params.id);
    if (!post) return res.status(404).send("The movie with the given ID was not found.");
    res.send("post deleted");
});


module.exports = router;