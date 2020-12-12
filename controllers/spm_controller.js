const Spm = require('../models').dok_spm;
const DokFile = require('../models').dokumen_files;
const LogActivity = require('../models').log_activity;
const { Op } = require('sequelize');
const {sequelize} = require('../models')
const setId = require('../helpers/setIdDocument');
const { CREATE, UPDATE, DELETE, PRINT, DOCUMENT } = require('../helpers/logType');
const xlsx = require('xlsx');
const moment = require('moment')

module.exports = {
    
    read: async(req, res) => {

        const {
            query : {
                dok_id, 
                skpd, 
                kepada, 
                keperluan,
                no_spm,
                no_sp2d,
                lokasi_fisik,
                tgl_spm,
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
        if (tgl_spm) {
            filter.where.tgl_spm = { [Op.like]: `%${tgl_spm}%` };
        }
        if (no_spm) {
            filter.where.no_spm = { [Op.like]: `%${no_spm}%` };
        }
        if (no_sp2d) {
            filter.where.no_sp2d = { [Op.like]: `%${no_sp2d}%` };
        }
        if (box) {
            filter.where.box = box;
        }
        if (is_active) {
            filter.where.is_active = is_active;
        }

        try {
            let {count: total, rows: data} = await Spm.findAndCountAll(filter);
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


            let newSpm = await sequelize.transaction(async (t) => {

                if(!req.file){
                    let count = await Spm.count() + 1;
                    let dokIdIndex = await setId(count);
                    req.body.dok_id =  `SPM_${dokIdIndex}`;
                }
                const newSpm  = await Spm.create(req.body, { transaction: t });

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

                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: CREATE,
                    activity_object: DOCUMENT,
                    activity_object_detil: newSpm.dok_id,
                    activity_desc: `${req.user.username} ${CREATE} ${DOCUMENT} ${newSpm.dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

                return newSpm;
            
            });

            if (newSpm) {
                res.status(200).json(newSpm);
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
        if (!Date.parse(req.body.tgl_spm)) {
            delete req.body.tgl_spm;
        }
        try {

            let updateSpm = await sequelize.transaction(async (t) => {


                let valiableSpm = await Spm.findOne({where:{ dok_id: req.params.id}});
            
                if (!valiableSpm) {
                    return res.status(404).send('gak ada sob');
                }

                if (req.body.lokasi_fisik) {
                    let box = req.body.lokasi_fisik.split('.');
                    box = box[box.length - 1];
                    req.body.box = box;
                }

                valiableSpm = await valiableSpm.update(req.body,{ transaction: t });

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
                    activity_object_detil: valiableSpm.dok_id,
                    activity_desc: `${req.user.username} ${UPDATE} ${DOCUMENT} ${valiableSpm.dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

                return valiableSpm
            });

            res.status(200).json(updateSpm);

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

                let valiableSpm = await Spm.findOne({
                    include: DokFile,
                    where:{ dok_id: req.params.id}
                });
            
                if (!valiableSpm) {
                    return res.status(404).send('gak ada sob');
                }

                res.status(200).json(valiableSpm);

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

            await sequelize.transaction(async (t) => { 
            
                let valiableSpm =  await Spm.findOne({where:{ dok_id: req.params.id}},{ transaction: t});
        
                if (!valiableSpm) {
                    return res.status(404).send('gak ada sob');
                }

                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: DELETE,
                    activity_object: DOCUMENT,
                    activity_object_detil: valiableSpm.dok_id,
                    activity_desc: `${req.user.username} ${DELETE} ${DOCUMENT} ${valiableSpm.dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});
    
                await valiableSpm.destroy({ transaction: t});
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
                return res.status(404).send('gak ada sob');
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

            let count = await Spm.count();
            
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
                        no_spm      : row['E'],
                        no_sp2d     : row['F'],
                        tgl_spm     : new moment.utc(row['G'],'DD-MM-YYYY'),
                        fk_cat_id   : 'spm',
                        dok_id      : `SPM_${dokIdIndex}`,
                        box         : box
                    };
                    let newSpm = await Spm.create(input,{ raw: true});

                    let now = moment(); 
                    await LogActivity.create({
                        fk_username: req.user.username,
                        activity_type: CREATE,
                        activity_object: DOCUMENT,
                        activity_object_detil: newSpm.dok_id,
                        activity_desc: `${req.user.username} ${CREATE} ${DOCUMENT} ${newSpm.dok_id} pada ${now}`,
                        activity_times: now,
                    });

                });

            res.status(200).json({
                success: true,
                data: 'import data telah berhasil dilakukan'
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
                skpd, 
                kepada, 
                keperluan,
                no_spm,
                no_sp2d,
                lokasi_fisik,
                tgl_spm,
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
        if (tgl_spm) {
            filter.where.tgl_spm = { [Op.like]: `%${tgl_spm}%` };
        }
        if (no_spm) {
            filter.where.no_spm = { [Op.like]: `%${no_spm}%` };
        }
        if (no_sp2d) {
            filter.where.no_sp2d = { [Op.like]: `%${no_sp2d}%` };
        }
        if (box) {
            filter.where.box = box;
        }
        if (is_active) {
            filter.where.is_active = is_active;
        }

        try {
            let {count: total, rows: data} = await Spm.findAndCountAll(filter);
            // let data = await Spj.findAll(filter);

            let ejs = require("ejs");
            let pdf = require("html-pdf");
            let path = require("path");

            let dataRender = await ejs.renderFile(path.join(__dirname,'../views/report/','spm.ejs'),{data,total});
            let options = {
                "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                "orientation": "landscape",
                "paginationOffset": 1,
                // "directory": '/temp',
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
                        activity_object_detil: 'LAPORAN SPM',
                        activity_desc: `${req.user.username} ${PRINT} ${DOCUMENT} SPM laporan pada ${now}`,
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