const {Question,validateQuestion,validateQuestionBody,validateQuestionTitle} = require("../models/questionModel");
const {Comment} = require("../models/commentModel");
const auth = require("../middleware/authorization");
const admin = require("../middleware/admin");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();

router.get("/get/:id" , async (req, res) => {
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


router.get("/get/:pagesize/:pagenum", async(req,res)=>{
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


router.get("/get/myquestions/:pagesize/:pagenum", auth, async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const questions = await Question
                            .find({"author._id" : req.user._id})
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
        const count = await Question.countDocuments({"author._id" : req.user._id});
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

router.put("/edit/title/:id", auth, async (req, res) => {
    try{
        const {error} = validateQuestionTitle(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).send("The question with the given ID was not found.");

        if(question.author._id !== req.user._id){
            return res.status(401).send("access denied.");
        }

        await Question.findByIdAndUpdate(req.params.id, {
            title: req.body.title
        }, {new: true});
        
        res.send("updated successfully");
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
        const {error} = validateQuestionBody(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).send("The question with the given ID was not found.");

        if(question.author._id !== req.user._id){
            return res.status(401).send("access denied.");
        }


        await Question.findByIdAndUpdate(req.params.id, {
            
            data : req.body.data
        }, {new: true});
       
        res.send("updated successfully");
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

        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).send("The question with the given ID was not found.");

        if(question.author._id !== req.user._id){
            return res.status(401).send("access denied.");
        }


        await Question.findByIdAndUpdate(req.params.id, {
            tags:[req.body.tags]
        }, {new: true});
       
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.delete("/delete/:id", auth, async (req, res) => {

try{
    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Invalid user.");

    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).send("The question with the given ID was not found.");

    if(question.author._id !== req.user._id){
        return res.status(401).send("access denied.");
    }

    await question.findByIdAndRemove(req.params.id);
    
    res.send("question deleted");
}
catch(ex){
    console.error(ex);
    res.status(500).json({
        error: "something went wrong try after some time!", 
    });
}

});


//admin privlagues

router.put("/admin/edit/title/:id", admin, async (req, res) => {
    try{
        const {error} = validateQuestionTitle(req.body);
        if (error) return res.status(400).send(error.details[0].message);


        const question = await Question.findByIdAndUpdate(req.params.id, {
            title: req.body.title
        }, {new: true});
        if (!question) return res.status(404).send("The question with the given ID was not found.");
        res.send("updated successfully");
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
        const {error} = validateQuestionBody(req.body);
        if (error) return res.status(400).send(error.details[0].message);


        const question = await Question.findByIdAndUpdate(req.params.id, {
            
            data : req.body.data
        }, {new: true});
        if (!question) return res.status(404).send("The question with the given ID was not found.");
        res.send("updated successfully");
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
        const question = await Question.findByIdAndUpdate(req.params.id, {
            tags:[req.body.tags]
        }, {new: true});
        if (!question) return res.status(404).send("The question with the given ID was not found.");
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.delete("/admin/delete/:id", admin, async (req, res) => {
    const question = await question.findByIdAndRemove(req.params.id);
    if (!question) return res.status(404).send("The question with the given ID was not found.");
    res.send("question deleted");
});

module.exports = router;