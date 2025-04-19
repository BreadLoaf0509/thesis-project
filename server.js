var user_id = 1; // This is a placeholder. You can replace it with the actual user ID from your authentication system.

// changes  

const express = require("express");
const multer = require("multer");
const path = require("path");

// const fs = require('fs');
// const util = require('util');
// const unlinkFile = util.promisify(fs.unlink);

const multerS3 = require("multer-s3-v2");
const { s3, getImageStream, deleteImage } = require("./s3.js");
const { dbConnection } = require("./db.js");
require("dotenv").config();

const storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { originalname: file.originalname });
    },
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
}).any();

function checkFileType(file, cb) {
    const fileTypes = /jpeg|png|jpg/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Please upload images only!");
    }
}

const port = 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
    dbConnection.query("SELECT * FROM images WHERE user_id = ?", [user_id], (err, result) => {
        if(!err) res.render("index", { images: result });
        else throw new Error(err)
    })
});

app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        if (!err && req.files != "") {
            saveImagesInDB(req.files)
            res.status(200).send();
        } else if (!err && req.files == "") {
            res.statusMessage = "Please select an image to upload!";
            res.status(400).end();
        } else {
            res.statusMessage =
                err === "Please upload images only!" ? err : "Photo exceeds 1MB limit!";
            res.status(400).end();
        }
    });
});

app.put("/delete", (req, res) => {
    const deleteImages = req.body.deleteImages;
    if (deleteImages == "") {
        res.statusMessage = "Please select an image to delete!";
        res.status(400).end();
    } else {
        // deleteImages.forEach((image) => {
        //     unlinkFile(`./public/uploads/` + image);
        // });
        deleteImagesFromS3(deleteImages);
        deleteImagesFromDB(deleteImages);
        res.statusMessage = "Image deleted successfully!";
        res.status(200).end();
    }
});

app.get("/:image_key", (req, res) => {
    const readStream = getImageStream(req.params.image_key);
    readStream.pipe(res);
})

function saveImagesInDB(images) {
    for (let i = 0; i < images.length; i++) {
        dbConnection.query("INSERT INTO images (user_id, image_key) VALUES (?, ?)",
            [user_id, images[i].key], (err, result) => {
                if (err) throw new Error(err);
            })
    }

}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function deleteImagesFromS3(images){
    for(let i = 0; i < images.length; i++){
        deleteImage(images[i]);
    }
}

function deleteImagesFromDB(images){
    for(let i = 0; i < images.length; i++){
        dbConnection.query("DELETE FROM images WHERE user_id = ? AND image_key = ?",
        [user_id, images[i]], (err, result) => {
            if (err) throw new Error(err);
        } )
    }
}

// changes

app.get("/guest-home", (req, res) => {
    res.render("guest/guest-home"); // Render the guest-home.ejs file
});

app.use(express.static("views"));
