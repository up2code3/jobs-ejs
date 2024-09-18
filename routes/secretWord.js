const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    if(!req.session.secretWord){
        req.session.secretWord = "syzygy";
    }
    res.render("secretWord", { secretWord: req.session.secretWord })
})

router.post("/", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == "P") {
        req.flash("error", "Can not be secret word")
        req.flash("error", "Secret Word can not start with P")
    }else{
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "the scret word has changed")
    }

    res.redirect("/secretWord")
});

module.exports = router;