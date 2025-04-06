const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    images: [{
        url: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
        }
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
   showTo: {
    type : String,
    default : "all",
   },
   
}, { timestamps: true });

module.exports = mongoose.model("gallery", gallerySchema);
