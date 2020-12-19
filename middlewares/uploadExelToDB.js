const multer  = require('multer');
const fs = require('fs');

const path = require('path');

const storage =  multer.diskStorage({
    destination: async function (req, file, cb) {
        let timestamp = new Date();
        timestamp = timestamp.getDate() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getFullYear();
        let destinationFolder = `${process.env.STORAGE_ROOT}${process.env.STORAGE_TEMP}/${timestamp}`;
        fs.mkdirSync(destinationFolder, { recursive: true })
        cb(null, destinationFolder)
    },
    filename: async function (req, file, cb) {
        let timestamp = new Date();
        timestamp = timestamp.getDate() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getFullYear()+ "_" + timestamp.getHours()+ "." + timestamp.getMinutes()+ "." + timestamp.getSeconds();
        let filename = timestamp + '_' +file.originalname;
        cb(null,filename);
    }
})

const uploadExel = multer({ 
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.xlsx') {
            return callback(new Error('Only exel (xlsx) are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024 * 50
    } 
});

module.exports = { uploadExel }