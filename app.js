const express = require("express");
require("express-async-errors")

const app = express();

//to load the .env file into the process.env object
require("dotenv").config();

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

//set up session store
const store = new MongoDBStore({
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

//configure secure cookies for production
if (app.get("env") === "production") {
    //trust first proxy
    app.set("trust proxy", 1);
    //serve secure cookies
    sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));
app.use(require("connect-flash")());

//body parser should be before passport
app.use(require("body-parser").urlencoded({ extended: true}));

//initialize Passport
const passport = require("passport");
const passportInit = require("./passport/passportInit")
passportInit();
app.use(passport.initialize())
app.use(passport.session())
app.use(require("./middleware/storeLocals"));

//set up view and engine routes
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"))

const auth = require("./middleware/auth")
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter)

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
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () => 
            console.log(`Server is listening on PORT ${port}...`)
    );
    } catch (error) {
        console.log(error);
    }
};

start();






