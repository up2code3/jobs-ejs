const Album = require("../models/Album")
const parseVErr = require("../utils/parseValidationErrs")


//shows all Albums
const getAlbums = async (req, res) => {
    const albums = await Album.find({ createdBy: req.user._id });  
    //render albums.ejs view
    res.render("albums", { albums }); 
};

//renders new album form
const newAlbum = async (req, res) => {
    res.render("album", {album:null})
}

//Add album button @bottom of newAlbum form
const addAlbum = async (req, res) => {
    try {
        console.log("Raw input:", req.body);
        console.log("Sanitized Input:", "\nArtist Field:" , req.body.artist, "\nAlbum Field:", req.body.album, "\nCondition Field:", req.body.condition)
//prepare the album data
        const albumData = {
            artist: req.body.artist,
            album: req.body.album,
            condition: req.body.condition,
            digitalRelease: req.body.digitalRelease,
            createdBy: req.user._id,
        };
//use Album model to create new entry w/ AlbumData object from above
        const newAlbum = await Album.create(albumData)
//send user back to all albums page
        res.redirect("/albums")
//if error occurs creating new entry
    } catch (error) {
        console.error(error);
        const validationErrors = parseVErr(error);
        res.render("album", { album: null, errors: validationErrors });
    }
};

//renders edit album form
const editAlbum = async (req, res) => {
//destructure album ID, extracts id from request parameters
    const {id} = req.params;
//use Album model to find album by id, then store in album variable
    const album = await Album.findById(id);
//renders the album view, pass album object to the view 
//this will populate form field with existing data
    res.render("album", {album} )
}

//Update Album Button @bottom of editAlbum form
const updateAlbum = async (req, res) => {
    try{
    const {id} = req.params;
    const albumData = {
        artist: req.body.artist,
        album: req.body.album,
        condition: req.body.condition,
        createdBy: req.user._id,
    }
    const updatedAlbum = await Album.findByIdAndUpdate(id, albumData, {new: true});
// Just in case , maybe this should be in editAlbum function?
    if (!updatedAlbum){
        return res.status(404).send("Album not Found")
    }

    res.redirect("/albums");
    }catch (error) {
        console.error(error);
        const validationErrors = parseVErr(error);

        res.render("album", { album: {...req.body, id}, errors: validationErrors });
}
};

const deleteAlbum = async (req, res) => {
    const {id} = req.params;
    try {
//delete album by id
        const deletedAlbum = await Album.findByIdAndDelete(id);
//check if the album was found and deleted
        if (!deletedAlbum){
            return res.status(404).send("Album not Found")
        }
//if album did delete, send user back to albums page
        res.redirect("/albums");
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
}

module.exports = {
    getAlbums,
    addAlbum,
    newAlbum,
    editAlbum,
    updateAlbum,
    deleteAlbum
};