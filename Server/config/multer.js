const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,"uploads/audio");
    },
    filename : function(req,file,cb){
        const uniqueName = Date.now() + "-" + Math.round(Math.random()*1E9);
        cb(null,uniqueName+path.extname(file.originalname));
    }
});

const fileFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith("audio/")){
        cb(null,true);
    }
    else{
        cb(new Error("Only audio files are allowed"),false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = upload;