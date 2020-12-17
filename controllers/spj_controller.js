const Spj = require('../models').dok_spj;
const DokFile = require('../models').dokumen_files;
const Category = require('../models').kategori;
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const setId = require('../helpers/setIdDocument');
const xlsx = require('xlsx');
const moment = require('moment');

const LogActivity = require('../models').log_activity;
const { PRINT, DOCUMENT, CREATE, UPDATE, DELETE } = require('../helpers/logType');

module.exports = {
    
    read: async(req, res) => {

        const {
            query : {
                dok_id, 
                lokasi_fisik, 
                skpd, 
                kepada,
                keperluan,
                tahun,
                box,
                is_active,
                page,
                limit
            }
        } = req;

        let filter = {
            raw: false,
            limit: parseInt(limit),
            offset: parseInt(limit) * (parseInt(page) - 1),
            order: [],
            where: {},
            include: DokFile,
        };

        if (dok_id) {
            filter.where.dok_id = { [Op.like]: `%${dok_id}%` };
        }
        if (lokasi_fisik) {
            filter.where.lokasi_fisik = { [Op.like]: `%${lokasi_fisik}%` };
        }
        if (skpd) {
            filter.where.skpd = { [Op.like]: `%${skpd}%` };
        }
        if (kepada) {
            filter.where.kepada = { [Op.like]: `%${kepada}%` };
        }
        if (keperluan) {
            filter.where.keperluan = { [Op.like]: `%${keperluan}%` };
        }
        if (tahun) {
            filter.where.tahun = tahun;
        }
        if (box) {
            filter.where.box = box;
        }
        if (is_active) {
            filter.where.is_active = is_active;
        }

        try {
            let {count: total, rows: data} = await Spj.findAndCountAll(filter);
            // let data = await Spj.findAll(filter);
            res.status(200).json({
                success: true,
                total,
                data
            });
        } catch(error){
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    create: async(req, res) => {

        try {

            let box = req.body.lokasi_fisik.split('.');
            box = box[box.length - 1];
            req.body.box = box;

            let newSpj = await sequelize.transaction(async(t) => {

                let CatSpj = await Category.findOne({
                    where:{ id: 'spj'}
                });
                let count = await CatSpj.index_id + 1;
                
                if(!req.file){
                    let dokIdIndex = await setId(count);
                    req.body.dok_id =  `SPJ_${dokIdIndex}`;
                }
                
                const newSpj  = await Spj.create(req.body, { transaction: t });

                if(req.file){
                    let pathFile = `${process.env.STORAGE_DOCUMENT}/${req.body.fk_cat_id}/${req.body.dok_id}`;
                    await DokFile.create({
                        dokumen_path: pathFile,
                        dokumen_id: req.body.dok_id,
                        dokumen_name: req.file.filename,
                        dokumen_size: req.file.size,
                        dokumen_file_type: req.file.mimetype
                    }, { transaction: t });
                }

                await CatSpj.update({
                    index_id: count
                },{ transaction: t})

                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: CREATE,
                    activity_object: DOCUMENT,
                    activity_object_detil: newSpj.dok_id,
                    activity_desc: `${req.user.username} ${CREATE} ${DOCUMENT} ${newSpj.dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});
            
                return newSpj;
            });

            if (newSpj) {
                res.status(200).json(newSpj);
            }

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    update: async(req, res) => {
        if (!Date.parse(req.body.date_in)) {
            delete req.body.date_in;
        }
        if (!Date.parse(req.body.date_received)) {
            delete req.body.date_received;
        }
        if (!Date.parse(req.body.date_retensi)) {
            delete req.body.date_retensi;
        }
        try {

            let updateSpj = await sequelize.transaction(async (t) => {


                let valiableSpj = await Spj.findOne({where:{ dok_id: req.params.id}});
            
                if (!valiableSpj) {
                    return res.status(404).json({success:false, message:'tidak ditemukan'})
                }

                if (req.body.lokasi_fisik) {
                    let box = req.body.lokasi_fisik.split('.');
                    box = box[box.length - 1];
                    req.body.box = box;
                }

                valiableSpj = await valiableSpj.update(req.body,{ transaction: t });

                if(req.file){
                    let valiableDokFile = await DokFile.findOne({where:{ dokumen_id: req.body.dok_id}});
                    let pathFile = `${process.env.STORAGE_DOCUMENT}/${req.body.fk_cat_id}/${req.body.dok_id}`;
                    
                    if (valiableDokFile) {;
                        await valiableDokFile.update({
                            dokumen_path: pathFile,
                            dokumen_id: req.body.dok_id,
                            dokumen_name: req.file.filename,
                            dokumen_size: req.file.size,
                            dokumen_file_type: req.file.mimetype
                        },{ transaction: t });
                    } else {
                        await DokFile.create({
                            dokumen_path: pathFile,
                            dokumen_id: req.body.dok_id,
                            dokumen_name: req.file.filename,
                            dokumen_size: req.file.size,
                            dokumen_file_type: req.file.mimetype
                        },{ transaction: t });
                    }
                }

                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: UPDATE,
                    activity_object: DOCUMENT,
                    activity_object_detil: valiableSpj.dok_id,
                    activity_desc: `${req.user.username} ${UPDATE} ${DOCUMENT} ${valiableSpj.dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});
                
                return valiableSpj
            });
    
            res.status(200).json(updateSpj);

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    readById: async(req, res) => {

        try {

                let valiableSpj = await Spj.findOne({
                    include: DokFile,
                    where:{ dok_id: req.params.id}
                });
            
                if (!valiableSpj) {
                    return res.status(404).json({success:false, message:'tidak ditemukan'})
                }

                res.status(200).json(valiableSpj);

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableSpj = await Spj.findOne({where:{ dok_id: req.params.id}});
        
            if (!valiableSpj) {
                return res.status(404).json({success:false, message:'tidak ditemukan'})
            }

            await sequelize.transaction(async t => {

                await valiableSpj.destroy({transaction:t});
    
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: DELETE,
                    activity_object: DOCUMENT,
                    activity_object_detil: valiableSpj.dok_id,
                    activity_desc: `${req.user.username} ${DELETE} ${DOCUMENT} ${valiableSpj.dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

            })

            res.status(200).json({
                success: true,
                message: 'data berhasil di hapus'
            })

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    sendFile: async(req, res) => {
        try {

            let valiableDokumen = await DokFile.findOne({where:{ dokumen_name: req.params.id}});
        
            if (!valiableDokumen) {
                return res.status(404).json({success:false, message:'tidak ditemukan'})
            }

            let file = `${process.env.STORAGE_ROOT}${valiableDokumen.dokumen_path}/${valiableDokumen.dokumen_name}`;
            res.download(file);

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    exelToDB: async (req, res) => {

        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }

        try {

            let path = `${req.file.destination}/${req.file.filename}`

            const workbook = xlsx.read(path, { type: 'file' });
            const [firstSheetName] = workbook.SheetNames;
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = await xlsx.utils.sheet_to_json(worksheet, {
                header: 'A',
                range: 0,
                blankrows: false,
                defval: null,
                raw: true,
            });

            rows.shift();
            rows.shift();
            rows.shift();

            let inputs = [];
            let count = await Spj.count();
            console.log(rows.length)
            rows.forEach(async (row) => {
                let box = row['A'].split('.');
                    box = box[box.length - 1];
                
                count++;
                let dokIdIndex = await setId(count);
                
                let input = {
                    lokasi_fisik: row['A'],
                    skpd        : row['B'],
                    kepada      : row['C'],
                    keperluan   : row['D'],
                    tahun       : row['E'],
                    fk_cat_id   : 'spj',
                    dok_id      : `SPJ_${dokIdIndex}`,
                    box         : box
                };
                inputs.push(input);
            });
                
            let totalInputSpj = await sequelize.transaction(async (t) => {

                let inputSpjs = await Spj.bulkCreate(inputs,{ transaction: t });
                return inputSpjs
            });

                res.status(200).json({
                    success: true,
                    data: totalInputSpj
                })

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    makeReport: async (req, res) => {
        const {
            query : {
                dok_id, 
                lokasi_fisik, 
                skpd, 
                kepada,
                keperluan,
                tahun,
                box,
                is_active,
                // page,
                // limit
            }
        } = req;

        let filter = {
            raw: false,
            // limit: parseInt(limit),
            // offset: parseInt(limit) * (parseInt(page) - 1),
            order: [],
            where: {},
            include: DokFile,
        };

        if (dok_id) {
            filter.where.dok_id = { [Op.like]: `%${dok_id}%` };
        }
        if (lokasi_fisik) {
            filter.where.lokasi_fisik = { [Op.like]: `%${lokasi_fisik}%` };
        }
        if (skpd) {
            filter.where.skpd = { [Op.like]: `%${skpd}%` };
        }
        if (kepada) {
            filter.where.kepada = { [Op.like]: `%${kepada}%` };
        }
        if (keperluan) {
            filter.where.keperluan = { [Op.like]: `%${keperluan}%` };
        }
        if (tahun) {
            filter.where.tahun = tahun;
        }
        if (box) {
            filter.where.box = box;
        }
        if (is_active) {
            filter.where.is_active = is_active;
        }

        try {
            let {count: total, rows: data} = await Spj.findAndCountAll(filter);

            let ejs = require("ejs");
            let pdf = require("html-pdf");
            let path = require("path");

            let dataRender = await ejs.renderFile(path.join(__dirname,'../views/report/','spj.ejs'),{data,total});
            let options = {
                "format": "A3",
                "orientation": "landscape",
                "paginationOffset": 1,
                "header": {
                    "height": "10mm",
                },
                "footer": {
                    "height": "10mm",
                },
            };

            pdf.create(dataRender, options).toFile("report.pdf", async function (err, data) {
                if (err) {
                    res.send(err);
                } else {

                    let now = moment(); 
                    await LogActivity.create({
                        fk_username: req.user.username,
                        activity_type: PRINT,
                        activity_object: DOCUMENT,
                        activity_object_detil: 'LAPORAN SPJ',
                        activity_desc: `${req.user.username} ${PRINT} ${DOCUMENT} SPJ laporan pada ${now}`,
                        activity_times: now,
                    });

                    res.download(data.filename);

                }
            });

        } catch(error){
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    }
}