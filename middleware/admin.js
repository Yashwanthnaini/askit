const jwt = require("jsonwebtoken");

function admin (req, res, next) {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
        if(!req.user.isAdmin) return res.status(403).send("Forbidden.");
        next();
    } 
    catch (ex) {
        console.log(ex);
        res.status(400).json({
            error:"Invalid token"
        });
    }
}

module.exports = admin;