const {Question,validateQuestion} = require("../models/questionModel");
const {Comment} = require("../models/commentModel");
const auth = require("../middleware/authorization");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();

router.get("/question/:id" , async (req, res) => {
    try{
        const question = await Question.findById(req.params.id);
        if(!question){
            return res.status(404).json({
                message : "This question doesn't exist"
            })
        }
        const comments = await Comment
                                    .find({"post._id":question._id})
                                    .select("comment author.name")
        res.json({
            question : question,
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


router.get("/:pagesize/:pagenum", async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const questions = await Question
                            .find()
                            .sort("date")
                            .select("_id title data author.name tags date")
                            .skip(pagesize*(pagenum-1))
                            .limit(pagesize);
        if(!questions){
            return res.json({
                message : "No questions found"
            })
        }
        const count = await Question.countDocuments({});
        res.json({
            questions : questions,
            totalquestions : count
        });                    
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});


router.get("/myquestions/:pagesize/:pagenum", auth, async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const questions = await Question
                            .find({"author.id" : req.user.id})
                            .sort("date")
                            .select("_id title data author.name tags date")
                            .skip(pagesize*(pagenum-1))
                            .limit(pagesize);
        if(!questions){
            return res.json({
                message : "No questions found",
                totalquestions : 0
            })
        }
        const count = await Question.countDocuments({"author.id" : req.user.id});
        res.json({
            questions : questions,
            totalquestions : count
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
        const {error} = validateQuestion(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const question = new Question({
            title: req.body.title,
            author: {
                _id: user._id,
                name: user.name
            },
            data : req.body.data,
            tags:[req.body.tags]
        });
        await question.save();
        res.json({
            message : "question created successfully"
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
        const {error} = validatequestion(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const question = await question.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            author: {
                _id: user._id,
                name: user.name
            },
            data : req.body.data,
            tags:[req.body.tags]
        }, {new: true});
        if (!question) return res.status(404).send("The movie with the given ID was not found.");
        res.send(question);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.delete("/:id", auth, async (req, res) => {
    const question = await question.findByIdAndRemove(req.params.id);
    if (!question) return res.status(404).send("The question with the given ID was not found.");
    res.send("question deleted");
});


module.exports = router;