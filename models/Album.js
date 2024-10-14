const mongoose = require('mongoose')

 const AlbumSchema = new mongoose.Schema(
    {
    artist:{
        type:String,
        required:[true, 'Enter Artist Name'],
        maxlength:50,
    },
    album:{
        type:String,
        required:[true, 'Enter Album Name'],
        maxlength:100,
    },
    condition:{
        type:String,
        enum:['Mint','Very Good','Good','Poor','N/A'],
        required:[true, 'Please select Condtion of Vinyl']
    },
    digitalRelease:{
        type: Boolean,
        default: false,
    },
    rating:{
        type: Number,
        required:[true, 'Please Rate the album on a scale of 1 - 5'],
        min:1,
        max:5
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required:[true, 'Please Provide user']
    }

 }, {timestamps:true})

 module.exports = mongoose.model('Album', AlbumSchema)