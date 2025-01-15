const express = require('express')
const app = express();
const cookieParser= require('cookie-parser')

app.use(cookieParser());

app.get("/", function (req,res){
    res.cookie("name","hello");
    const msg="Hello cookie is saved"
    res.status(202).send(msg);
});

app.get("/api",(req,res)=>{
    console.log(req.cookies.name)
    res.status(200).send("cookie received")
});

app.listen(8080);