const {getGoogleOAuthURL,getGoogleToken,getGoogleUser} = require("../resources/oauthGoogleUri");
const {User} = require("../models/userModel");
const express = require("express");
const { random } = require("lodash");
const router = express.Router();

router.get('/google', (req, res) => {
    const uri = getGoogleOAuthURL();
    res.redirect(uri);
}
);

router.get("/handler/google", async(req, res) => {
    const code = req.query.code;
    console.log(code);
    try{
        const {id_token,access_token} = await getGoogleToken({code});

        const googleUser = await getGoogleUser({id_token,access_token});
        console.log(googleUser);

        if(!googleUser.verified_email) {
            return res.status(403).json({
                error: "Google account is not verified", 
            });
        }
        let extra_name = Math.floor(100000 + Math.random() * 900000);
        const name = googleUser.family_name+extra_name;
        let user = await User.findOne({email: googleUser.email});
        if(!user){
            user = new User({
                name: name,
                email: googleUser.email,
                isVerified: true,
            });
            await user.save();
        }
        
        const token = user.generateAuthToken();
        res.cookie('x-auth-token',token);
        res.redirect("https://askito.herokuapp.com/api/users/me");
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "something went wrong try after some time!", 
        });
    }
    
}
);
module.exports = router;