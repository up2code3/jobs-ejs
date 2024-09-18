const authMiddleware = (req, res, next) => {
    if (!req.user) {
        req.flash("error", "Must log in to access")
        res.redirect("/")
    }else{
       next(); 
    }
};

module.exports = authMiddleware;