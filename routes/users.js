const {User, validateUser, validateLogin, validateUsername, validateUserEmail, validateUserPassword, validateUserDOB, validateUserGender} = require("../models/userModel");
const auth = require("../middleware/authorization");
const emailVerify = require("../middleware/emailVerify");
const resetVerify = require("../middleware/resetVerify");
const admin = require("../middleware/admin");
const sendEmail = require("../resources/mailer");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.get("/get/me", auth ,async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password -__v -isAdmin");
        if(!user){
            return res.json({
                error : "invalid token"
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

router.get("/get/user/:name", async(req, res)=>{
    try{
        const user = await User.findOne({name: req.params.name}).select("-password -isAdmin -_id -__v -isVerified ");
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

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
        let username = await User.findOne({name: req.body.name});
        if(username){
            return res.status(400).json({
                error: "try different username"
            });
        }
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

router.get("/get/verify",auth,async (req, res) => {
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
        if(!user.password) return res.status(400).json({
            error : "try login using google"
        });
        
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({
            error: "Invalid email or password",
        });
        
        const token = user.generateAuthToken();
        res.header('x-auth-token',token)
        .header("access-control-expose-headers", "x-auth-token")
        .json({
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


router.post("/forgot",async (req, res) => {
    try{
        const {error} = validateUserEmail(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const email = req.body.email;
        const user = await User.findOne({email: email});
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

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

router.post("/reset",auth,async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

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
        const {error} = validateUserPassword(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

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


router.put("/update",auth, async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        let username = await User.findOne({name: req.body.name});
        if(username){
            return res.status(400).json({
                error: "try different username"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);

        await User.findByIdAndUpdate(req.user._id, {
            name: req.body.name,
            email: req.body.email,
            password: password,
            dob: req.body.dob,
            gender: req.body.gender,
            expertIn: [req.body.expertIn],
            bio: req.body.bio,
            url: req.body.url,
            twitterUrl: req.body.twitterUrl,
            instagramUrl: req.body.instagramUrl,
            location: req.body.location
        }, {new: true});
        
        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.put("/edit/username",auth, async (req, res) => {
    try{
        const {error} = validateUsername(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        let username = await User.findOne({name: req.body.name});
        if(username){
            return res.status(400).json({
                error: "try different username"
            });
        }

        await User.findByIdAndUpdate(req.user._id, {
            name: req.body.name
        }, {new: true});
        
        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.put("/edit/email",auth, async (req, res) => {
    try{
        const {error} = validateUserEmail(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        await User.findByIdAndUpdate(req.user._id, {
            isVerified: false,
            email: req.body.email
        }, {new: true});
        
        const token = user.generateVerifyToken();
        await sendEmail(user.email, token, user.name, "verify");

        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


router.put("/edit/dob",auth, async (req, res) => {
    try{
        const {error} = validateUserDOB(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        await User.findByIdAndUpdate(req.user._id, {
            dob: req.body.dob
        }, {new: true});

        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.put("/edit/gender",auth, async (req, res) => {
    try{
        const {error} = validateUserGender(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        const newUser = await User.findByIdAndUpdate(req.user._id, {
            gender: req.body.gender
        }, {new: true});

        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.put("/edit/expertin",auth, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        await User.findByIdAndUpdate(req.user._id, {
            expertIn: [req.body.expertIn]
        }, {new: true});

        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


//admin previlages


router.get("/get/:pagesize/:pagenum",admin, async(req,res)=>{
    const pagesize = req.params.pagesize
    const pagenum = req.params.pagenum
    try{
        const users = await User
                            .find()
                            .sort("name")
                            .select("_id name email")
                            .skip(pagesize*(pagenum-1))
                            .limit(pagesize);
        if(!users){
            return res.json({
                message : "No users found"
            })
        }
        const count = await User.countDocuments({});
        res.json({
            users: users,
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


router.put("/admin/update", admin, async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let username = await User.findOne({name: req.body.name});
        if(username){
            return res.status(400).json({
                error: "try different username"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);

        await User.findByIdAndUpdate(req.user._id, {
            name: req.body.name,
            email: req.body.email,
            password: password,
            dob: req.body.dob,
            gender: req.body.gender,
            expertIn: [req.body.expertIn],
            bio: req.body.bio,
            url: req.body.url,
            twitterUrl: req.body.twitterUrl,
            instagramUrl: req.body.instagramUrl,
            location: req.body.location
        }, {new: true});
        
        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


router.delete("/delete/:id" ,admin, async (req, res)=> {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).json({
        error : "The user with the given ID was not found."
    });
    res.json({
        message : "user deleted successfully"
    });
})


router.put("/edit/username/:id",admin, async (req, res) => {
    try{
        const {error} = validateUsername(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });

        let username = await User.findOne({name: req.body.name});
        if(username){
            return res.status(400).json({
                error: "try different username"
            });
        }

        const newUser = await User.findByIdAndUpdate(req.user._id, {
            name: req.body.name
        }, {new: true});
        
        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});

router.put("/edit/email/:id", admin, async (req, res) => {
    try{
        const {error} = validateUserEmail(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });


        await User.findByIdAndUpdate(req.params._id, {
            email : req.body.email,
            isVerified : false
        }, {new: true});
        
        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});


router.put("/edit/gender/:id",admin, async (req, res) => {
    try{
        const {error} = validateUserGender(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });


        await User.findByIdAndUpdate(req.user._id, {
            gender: req.body.gender
        }, {new: true});
        
        res.json({
            message : "updated successfully"
        });
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }

});
router.put("/edit/dob/:id",admin, async (req, res) => {
    try{
        const {error} = validateUserDOB(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).json({
            error: "invalid user"
        });


        await User.findByIdAndUpdate(req.user._id, {
            dob: req.body.dob
        }, {new: true});
        
        res.json({
            message : "updated successfully"
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
