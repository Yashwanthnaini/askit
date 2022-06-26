const {User} = require("../models/userModel");
const {Post} = require("../models/postModel");
const {Question} = require ("../models/questionModel");

const express = require("express");
const router = express.Router();

router.get("/:keyword", async(req, res)=>{
    try{
        
        const users = await User.find({ name: { $regex: `${req.params.keyword}`, $options: 'i'}}).select("name _id");
        const posts = await Post.find({$or:[{ title: { $regex: `${req.params.keyword}`,$options: 'i'}},{ tags: { $in: [`${req.params.keyword}`] }}]}).select("title _id tags");
        const questions = await Question.find({$or:[{ title: { $regex: `${req.params.keyword}`,$options: 'i'}},{ tags: { $in: [`${req.params.keyword}`] }}]}).select("title _id tags");
        res.json({
            users : users,
            posts : posts,
            questions : questions
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});


router.post("/posts/tags", async(req, res)=>{
    try{
        const posts = await Post.find({ tags: { $in: req.body.tags }}).select("title _id tags");
        res.json({
            posts : posts
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.post("/questions/tags", async(req, res)=>{
    try{
        const questions = await Question.find({ tags: { $in: req.body.tags[0] }}).select("title _id tags");
        res.json({
            questions : questions
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

module.exports = router;