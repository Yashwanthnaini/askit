const express = require("express");
const router = express.Router();

router.get("/keyword", async(req, res)=>{
    try{
        const user = await User.find({name: /${req.query.keyword}/i}).select("-password -isAdmin -_id -__v -isVerified");
        if(!user){ 
           return res.status(404).json({
                error: "user not found"
           });
        }
        res.send(user);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});

module.exports = router;