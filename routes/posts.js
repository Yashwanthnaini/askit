const {Post,validatePost,validatePostTitle,validatePostBody} = require("../models/postModel");
const {Comment} = require("../models/commentModel");
const auth = require("../middleware/authorization");
const admin = require("../middleware/admin");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();

router.get("/get/:id" , async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                message : "This post doesn't exist"
            })
        }
        const comments = await Comment
                                    .find({"post._id":post._id})
                                    .select("comment author.name")
        res.json({
            post : post,
            comments : comments
        })
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})


router.get("/get/:pagesize/:pagenum", async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const posts = await Post
                            .find()
                            .sort("date")
                            .select("_id title data author.name tags date")
                            .skip(pagesize*(pagenum-1))
                            .limit(pagesize);
        if(!posts){
            return res.json({
                message : "No posts found"
            })
        }
        const count = await Post.countDocuments({});
        res.json({
            posts : posts,
            totalPosts : count
        });                    
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});


router.get("/get/myposts/:pagesize/:pagenum", auth, async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const posts = await Post
                            .find({"author.id" : req.user.id})
                            .sort("date")
                            .select("_id title data author.name tags date")
                            .skip(pagesize*(pagenum-1))
                            .limit(pagesize);
        if(!posts){
            return res.json({
                message : "No posts found",
                totalPosts : 0
            })
        }
        const count = await Question.countDocuments({"author.id" : req.user.id});
        res.json({
            posts : posts,
            totalPosts : count
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
                name: user.name
            },
            data : req.body.data,
            tags:[req.body.tags]
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

router.put("/edit/title/:id", auth, async (req, res) => {
    try{
        const {error} = validatePostTitle(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const post = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title
        }, {new: true});
        if (!post) return res.status(404).send("The post with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.put("/edit/data/:id", auth, async (req, res) => {
    try{
        const {error} = validatePostBody(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const post = await Post.findByIdAndUpdate(req.params.id, {
            data : req.body.data
        }, {new: true});
        if (!post) return res.status(404).send("The post with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


router.put("/edit/tags/:id", auth, async (req, res) => {
    try{

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const post = await Post.findByIdAndUpdate(req.params.id, {
            tags:[req.body.tags]
        }, {new: true});
        if (!post) return res.status(404).send("The post with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.delete("/delete/:id", auth, async (req, res) => {
    const post = await findById(req.params.id);
    if(!post) return res.status(404).send("The post with the given ID was not found.");
    if(post.author.name !== req.user.name){
        return res.status(401).send("access denied.");
    }
    await Post.findByIdAndRemove(req.params.id);
    res.send("post deleted");
});



//admin privlagues


router.put("/admin/edit/title/:id", admin, async (req, res) => {
    try{
        const {error} = validatePostTitle(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const post = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title
        }, {new: true});
        if (!post) return res.status(404).send("The post with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});



router.put("/admin/edit/data/:id", admin, async (req, res) => {
    try{
        const {error} = validatePostBody(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const post = await Post.findByIdAndUpdate(req.params.id, {
            data : req.body.data
        }, {new: true});
        if (!post) return res.status(404).send("The post with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


router.put("/admin/edit/tags/:id", admin, async (req, res) => {
    try{
        const post = await Post.findByIdAndUpdate(req.params.id, {
            tags:[req.body.tags]
        }, {new: true});
        if (!post) return res.status(404).send("The post with the given ID was not found.");
        res.send(post);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


router.delete("/admin/delete/:id", admin, async (req, res) => {
    const post = await findById(req.params.id);
    if(!post) return res.status(404).send("The post with the given ID was not found.");
    await Post.findByIdAndRemove(req.params.id);
    res.send("post deleted");
});


module.exports = router;