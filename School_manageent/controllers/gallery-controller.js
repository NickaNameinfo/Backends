const Gallery = require("../models/gallerySchema.js");
const multer = require("multer"); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage }).array("images", 10);

const addGallery = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const { title, description, uploadedBy, school, showTo } = req.body;
        const images = req?.files?.map(file => ({ url: file.path }));
        try {
            const gallery = new Gallery({ title, description, images, uploadedBy, school, showTo });
            const result = await gallery.save();
            res.send(result);
        } catch (err) {
            res.status(500).json(err);
        }
    });
};

const getGalleryBySchool = async (req, res) => {
    try {
        const galleries = await Gallery.find({ school: req.params.id }).populate("uploadedBy", "name email");
        if (galleries.length > 0) {
            res.send(galleries);
        } else {
            res.send({ message: "No galleries found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getGalleryDetail = async (req, res) => {
    try {
        const gallery = await Gallery.find({uploadedBy:req.params.id}).populate("uploadedBy", "name email");
        if (gallery) {
            res.send(gallery);
        } else {
            res.send({ message: "Gallery not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateGallery = async (req, res) => {
    try {
        const updatedGallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updatedGallery);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteGallery = async (req, res) => {
    try {
        const deletedGallery = await Gallery.findByIdAndDelete(req.params.id);
        res.send(deletedGallery);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    addGallery,
    getGalleryBySchool,
    getGalleryDetail,
    updateGallery,
    deleteGallery
};
