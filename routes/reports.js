const {Report,validateReport} = require("../models/reportModel");
const auth = require("../middleware/authorization");
const admin = require("../middleware/admin");
const {User} = require("../models/userModel");
const {Post} = require("../models/postModel");
const {Question} = require("../models/questionModel");
const {Comment} = require("../models/commentModel");
const {Answer} = require("../models/answerModel");
const express = require("express");
const router = express.Router();


router.post("/add", auth, async (req,res) => {
    try{
        const {error} = validateReport(req.body);
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
        else if (req.body.type==="comment"){
            post = await Comment.findById(req.body.postId);
        }
        else {
            post = await Answer.findById(req.body.PostId);
        }
        
        if(!post) return res.status(400).send(`invalid ${req.body.type}`);

        const report = new Report ({
            report: req.body.report,
            author:{
                _id: user._id,
                name : user.name,
                email : user.email
            },
            post:{
                _id: req.body.postId,
                author_id:post.author._id
            }, 
            type: req.body.type
        })
        await report.save();
        res.json({
            message : "report updated successfully"
        })
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }


})

//admin privlagues

router.get("/admin/get/:pagesize/:pagenum",admin, async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const reports = await Report
                            .find()
                            .sort("-date")
                            .select("-__v")
                            .skip(pagesize*(pagenum-1))
                            .limit(pagesize);
        if(!reports){
            return res.json({
                message : "No reports found"
            })
        }
        const count = await Report.countDocuments({});
        res.json({
            reports: reports,
            totalReports : count
        });                    
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

router.get("/admin/get/report/:id", admin, async(req, res)=>{
    try{
        const report = await Report.findById(req.params.id).select("-__v");
        if (!report) return res.status(400).json({
            error: "invalid report"
        });

        res.send(report);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});


router.delete("/admin/delete/:id" ,admin, async (req, res)=> {
    const report = await Report.findByIdAndRemove(req.params.id);
    if (!report) return res.status(404).json({
        error : "The report with the given ID was not found."
    });
    res.json({
        message : "report deleted successfully"
    });
})



module.exports = router;