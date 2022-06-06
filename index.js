require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost:27017/vidly',{ useNewUrlParser: true , useUnifiedTopology: true })
    .then(()=>{ return console.log("Connected to MongoDB Localhost...");
    })
    .catch((err)=>{
        console.log(" cannot connect to mongodb \n error: ", err);
    })

require("./src/validation")();
require("./src/routes")(app);
require("./src/prodMidWare")(app);



const port = process.env.PORT || 3000;
app.listen(port , () =>{
    console.log(`server listening on port ${port} `);
})