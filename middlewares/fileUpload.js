const multer  = require('multer');
const fs = require('fs');
const Spm = require('../models').dok_spm;
const Spj = require('../models').dok_spj;

const path = require('path');

const documentStorage =  multer.diskStorage({
    destination: async function (req, file, cb) {
        console.log(req.body)

        if(req.method === 'POST') {
            let count = req.body.fk_cat_id === 'spm' ? await Spm.count() + 1 : await Spj.count() + 1;
            count = '' + count;
            while (count.length < 8) {
                count = '0' + count;
            }
            let dok_id = req.body.fk_cat_id === 'spm' ? `SPM_${count}` : `SPJ_${count}`;
            req.body.dok_id = dok_id;
    
        } else if (req.method === 'PUT') {
            req.body.dok_id = req.params.id;
        }

        let destinationFolder = `${process.env.STORAGE_ROOT}${process.env.STORAGE_DOCUMENT}/${req.body.fk_cat_id}/${req.body.dok_id}`;
        fs.mkdirSync(destinationFolder, { recursive: true })
        cb(null, destinationFolder)
    },
    filename: async function (req, file, cb) {
        let timestamp = new Date();
        timestamp = timestamp.getDate() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getFullYear()+ "_" + timestamp.getHours()+ "." + timestamp.getMinutes()+ "." + timestamp.getSeconds();
        let filename = timestamp +  '_'  + req.body.dok_id + '.' +file.originalname.split('.')[file.originalname.split('.').length -1];
        cb(null,filename);
    }
})

const upload = multer({ 
    storage: documentStorage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf') {
            return callback(new Error('Only png, jpg, jpeg and pdf are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024 * 10
    } 
});

module.exports = { upload }