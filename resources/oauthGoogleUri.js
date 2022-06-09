const { default: axios } = require("axios");
const res = require("express/lib/response");
function getGoogleOAuthURL(){
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options={
        redirect_uri:process.env.GOOGLE_REDIRECT_URI,
        client_id:process.env.GOOGLE_CLIENT_ID,
        access_type:"offline",
        response_type:"code",
        prompt:"consent",
        scope:[
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ].join(" "),
    };
    
    const qs = new URLSearchParams(options); 
    //console.log(qs.toString());
    return `${rootUrl}?${qs.toString()}`;
    
}

async function getGoogleToken({code}){
    const rootUrl = "https://oauth2.googleapis.com/token";
    const options={
        code,
        client_id:process.env.GOOGLE_CLIENT_ID,
        client_secret:process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:process.env.GOOGLE_REDIRECT_URI,
        grant_type:"authorization_code",
    };
    try{
        const response = await axios.post(rootUrl,new URLSearchParams(options).toString(),
        {
            headers:{
                "Content-Type":"application/x-www-form-urlencoded"
            },
        });
        return response.data;
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "can't get google token", 
        });
    }
}

async function getGoogleUser({id_token,access_token}){
    const rootUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
    try{
        const response = await axios.get(`${rootUrl}?alt=json&access_token=${access_token}`,
        {
            headers:{
                Authorization: `Bearer ${id_token}`
            }
        });
        return response.data;
    }
    catch(ex){
        console.error(ex);
        res.status(500).json({
            error: "Google authentication failed!", 
        });
    }
}

module.exports.getGoogleOAuthURL = getGoogleOAuthURL;
module.exports.getGoogleToken = getGoogleToken;
module.exports.getGoogleUser = getGoogleUser;