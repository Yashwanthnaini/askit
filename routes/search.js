const {User} = require("../models/userModel");
const {Post} = require("../models/postModel");
const {Question} = require ("../models/questionModel");

const express = require("express");
const router = express.Router();

router.get("/:keyword", async(req, res)=>{
    try{
        const users = await User.find({name: /.*${req.query.keyword}*./i}).select("name _id");
        const posts = await Post.find({title: /.*${req.query.keyword}*./i}).select("title _id");
        const questions = await Question.find({title: /.*${req.query.key}*./i}).select("title _id");
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

module.exports = router;