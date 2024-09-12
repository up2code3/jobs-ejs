const express = require("express");
require("express-async-errors")

const app = express();

//to load the .env file into the process.env object
require("dotenv").config();

const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    //May throw error, that will not be caught
    uri: url,
    collection: "mysessions",
})
store.on("error", function (error){
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized:true,
    store:store,
    cookie: { secure: false, sameSite: "strict"},
};

if (app.get("env") === "production") {
    //trust first proxy
    app.set("trust proxy", 1);
    //serve secure cookies
    sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

app.use(require("connect-flash")());

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true}));

// secret word handling
// let secretWord = "syzygy";

app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord){
    req.session.secretWord = "syzygy"
  }
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  
  res.render("secretWord", {secretWord: req.session.secretWord});

});


app.post("/secretWord", (req, res) => {
    if(req.body.secretWord.toUpperCase()[0] == "P") {
        req.flash("error", "That word will NOT work!");
        req.flash("error", "You can not use words that start with p");
    }else{
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "The secret word was changed")
    }
    res.redirect("/secretWord")
});

app.use((req, res) => {
    res.status(404).send(`Page (${req.url}) not found`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        app.listen(port, () => 
            console.log(`Server is listening on PORT ${port}...`)
    );
    } catch (error) {
        console.log(error);
    }
};

start();