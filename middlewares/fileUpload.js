const multer  = require('multer');
const fs = require('fs');
const Category = require('../models').kategori;
const setId = require('../helpers/setIdDocument');

const path = require('path');

const documentStorage =  multer.diskStorage({
    destination: async function (req, file, cb) {

        if(req.method === 'POST') {
            let dokIdIndex = ''
            if (req.body.fk_cat_id === 'spm') {
                let CatSpj = await Category.findOne({
                    where:{ id: 'spm'}
                });
                let count = await CatSpj.index_id + 1;
                dokIdIndex = await setId(count);
            } else {
                let CatSpj = await Category.findOne({
                    where:{ id: 'spj'}
                });
                let count = await CatSpj.index_id + 1;
                dokIdIndex = await setId(count);
            }
            let dok_id = req.body.fk_cat_id === 'spm' ? `SPM_${dokIdIndex}` : `SPJ_${dokIdIndex}`;
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
        if(ext !== '.pdf') {
            return callback(new Error('Only pdf are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024 * 50
    } 
});

module.exports = { upload }