const home = require("../routes/home");
const users = require("../routes/users");
const search = require("../routes/search");
const post = require("../routes/posts");
//const questions = require("../routes/questions");
//const answers = require("../routes/answers");
const oauth = require("../routes/oauth");
const blog = require("../routes/blog");
const auth = require("../routes/auth");
const cors = require('cors');
const express = require ("express");

module.exports = function (app) {
    app.use(express.json());//body parser
    app.use(express.urlencoded({extended: true}));//for html forms
    app.use(express.static('public'));//to load html files
    app.use(cors());

    app.use("/", home);
    app.use("/api/users", users);
    app.use("/api/oauth", oauth);
    app.use("/api/search", search);
    app.use("api/posts",post)
    // app.use("/api/questions", questions);
    // app.use("/api/blog", blog);
    // app.use("/api/auth", auth);
}