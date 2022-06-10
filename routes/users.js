const {User, validateUser,validateLogin} = require("../models/userModel");
const auth = require("../middleware/authorization");
const emailVerify = require("../middleware/emailVerify");
const resetVerify = require("../middleware/resetVerify");
const admin = require("../middleware/admin");
const sendEmail = require("../resources/mailer");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.get("/me", auth ,async (req, res) => {
    try{
        if(!req.user.isVerified){
            return res.json({
                error: "verify your email first"
            })
        }
        const user = await User.findById(req.user._id).select("-password -__v -isAdmin");
        if(!user){
            return res.json({
                message : "invalid token"
            })
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

router.get("/user/:name", async(req, res)=>{
    try{
        const user = await User.findOne({name: req.params.name}).select("-password -isAdmin -_id -__v -isVerified");
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

router.post("/register", async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({email: req.body.email});
        if (user) return res.status(400).json({
            error: "User already exists"
        });

        user = new User(_.pick(req.body, ["name", "email", "password"]));

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        const token = user.generateVerifyToken();
        await sendEmail(user.email, token, user.name, "verify");

        res.json({
            message: "User created successfully. Check your email for verification link"
        });
       
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
    
});

router.get("/verify",auth,async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        const token = user.generateVerifyToken();
        await sendEmail(user.email, token, user.name,"verify");
        res.json({
            message: "verification email sent successfully to your email"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!",
        });
    }
});


router.get("/verify/:token", emailVerify, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            return res.redirect("http://localhost:3000/email/verify/invalid");
        }
        user.isVerified = true;
        await user.save();
        res.redirect("http://localhost:3000/email/verify");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
});


router.post("/login", async (req, res) => {
    try{
        const {error} = validateLogin(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({email: req.body.email});
        if (!user) return res.status(400).json({
            error: "Invalid email or password"
        });
        
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({
            error: "Invalid email or password",
        });
        
        const token = user.generateAuthToken();
        res.header('x-auth-token',token).json({
            message: "login successful",
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
    
});


router.post("/reset",async (req, res) => {
    try{
        const email = req.body.email;
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(404).json({
                error: "user not found"
            });
        }
        const token = user.generateResetToken();
        await sendEmail(user.email, token, user.name, "reset");
        res.json({
            message: "password reset email sent successfully to your email"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!",
        });
    }
});

router.post("/reset/:token", resetVerify, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({
                error: "user not found"
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        await user.save();
        res.json({
            message: "password reset successfully"
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
