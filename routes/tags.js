const express = require("express");
const router = express.Router();
const {Tag , validateTag} = require("../models/tagModel");
const admin = require("../middleware/admin");

router.get("/", admin, async (req, res) => {
    try{
        const tags = await Tag
                        .fing()
                        .select("name")
                        .sort({name : 1})
        res.send(tags);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
    
});

router.post("/add", admin, async (req, res) => {
    try{
        const {error} = validateTag(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        const tag = new Tag({
            name : req.body.name
        });
       
        await tag.save();
        res.json({
            message : "tags saved sucessfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

})

module.exports = router

