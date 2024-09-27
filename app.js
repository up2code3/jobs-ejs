
const auth = require("./middleware/auth")
const secretWordRouter = require("./routes/secretWord");
const passport = require("passport");
const passportInit = require("./passport/passportInit")
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require('host-csrf')
const cookieParser = require("cookie-parser")
const jobs = require("./routes/jobs")
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

require("express-async-errors")
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(xss())
console.log("xss is running")
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "too many requests, please try later",
});
app.use(limiter)


//to load the .env file into the process.env object
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

app.use(cookieParser(process.env.SESSION_SECRET))

//CSRF middleware setup
let csrf_development_mode = true;

if (app.get("env") === "production"){
    csrf_development_mode = false;
}
const csrf_options = {
    protected_operations: ["PATCH"], 
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};

const csrf_middleware = csrf(csrf_options);

app.use(csrf_middleware)

app.get("/get_token", (req, res) => {
    const csrfToken = csrf.token(req,res);
    res.json({csrfToken})
})

//initialize Passport
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

app.use("/secretWord", auth, secretWordRouter)

app.use("/jobs", auth, jobs);

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

