const User = require("../models/User.js");
const parseVErr = require("../utils/parseValidationErrs.js");

const registerShow = (req, res) => {
    res.render("register");
}

const registerDo = async (req, res, next) => {
    if (req.body.password != req.body.password1){
        req.flash("error", "the 2 passwords do not match");  
        return res.status(400).render("register", { errors: req.flash("errors") });      
    }
    try {
        await User.create(req.body);    
    } catch (e) {
        if (e.constructor.name === "ValidationError"){
            parseVErr(e, req);
        } else if (e.name === "MongoServerError" && e.code === 11000) {
            req.flash("error", "Email address already in use")        
        } else {
            return next(e)
        }
        return res.status(400).render("register", { errors: req.flash("errors")})
    }
    res.redirect("/");
}

const logoff = (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
};

const logonShow = (req, res) => {
    if (req.user) {
       return res.redirect("/secretWord") 
    }
    res.render("logon")    
};

module.exports = {
    registerShow,
    registerDo,
    logoff,
    logonShow
}