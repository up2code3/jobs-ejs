const express = require("express")

const router = express.Router()

const {
    getAlbums,
    addAlbum,
    newAlbum,
    editAlbum,
    updateAlbum,
    deleteAlbum
} = require("../controllers/albums")

//Routes
router.get("/", getAlbums);
router.post("/", addAlbum);
router.get("/new",newAlbum);
router.get("/edit/:id",editAlbum);
router.post("/update/:id", updateAlbum);
router.post("/delete/:id", deleteAlbum);

module.exports = router;