require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const app = express();


mongoose.connect(process.env.MONGO_PROD_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection Success.");
  })
  .catch((err) => {
    console.error("Mongo Connection Error", err);
  });


require("./src/validation")();
require("./src/prodMidWare")(app);
require("./src/routes")(app);


const port = process.env.PORT || 3000;
app.listen(port , () =>{
    console.log(`server listening on port ${port} `);
})