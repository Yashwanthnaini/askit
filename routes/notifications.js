const {Notification,validateNotification} = require("../models/notificationModel");
const auth = require("../middleware/authorization");
const {User} = require("../models/userModel");
const express = require("express");
const router = express.Router();

router.get("/get/" , auth, async (req,res) =>{
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            return res.json({
                message : "invalid token"
            })
        }
        const notifications = await Notification
                                            .find({"user._id":user._id})
                                            .select("notification isNoticied")
                                            .sort("-date")
        res.send(notifications);
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})

router.post("/add", auth, async (req, res) => {
    try{
        const {error} = validateNotification(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const notification = new Notification ({
            notification: req.body.notification,
            user:{
                _id: user._id,
            }
        })
        await notification.save();
        res.json({
            message : "notification updated successfully"
        })
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})

router.put ("/update/noticed/:id", auth, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).send("Invalid user.");

        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).send("The notification with the given ID was not found.");

        if(notification.user._id != req.user._id){
            return res.status(401).send("access denied.");
        }
        
        await Notification.findByIdAndUpdate(req.params.id, {
            isNoticied: true
        }, {new: true});
        res.send("updated successfully");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
})


module.exports = router;