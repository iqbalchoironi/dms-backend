const Spm = require('../models').dok_spm;
const DokFile = require('../models').dokumen_files;
const LogActivity = require('../models').log_activity;
const Category = require('../models').kategori;
const { Op } = require('sequelize');
const {sequelize} = require('../models')
const setId = require('../helpers/setIdDocument');
const { CREATE, UPDATE, DELETE, PRINT, DOCUMENT } = require('../helpers/logType');
const xlsx = require('xlsx');
const moment = require('moment');
const puppeteer = require("puppeteer");
const toPdf = require('../helpers/toPdf');
const path = require("path");

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
            if(tgl_spm.length === 4) {
                filter.where.tgl_spm = sequelize.where(sequelize.fn('YEAR', sequelize.col('tgl_spm')), tgl_spm);
            } else if (tgl_spm.length === 2){
                filter.where.tgl_spm = sequelize.where(sequelize.fn('MONTH', sequelize.col('tgl_spm')), tgl_spm);
            } else {
                filter.where.tgl_spm = {  [Op.between]: [new Date(tgl_spm), new Date(tgl_spm).setHours(24,0,0)] };
            }
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
                
                let CatSpm = await Category.findOne({
                    where:{ id: 'spm'}
                });
                let count = await CatSpm.index_id + 1

                if(!req.file){
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

                await CatSpm.update({
                    index_id: count
                },{ transaction: t})

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
                    return res.status(404).json({success:false, message:'tidak ditemukan'})
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
                return res.status(404).json({success:false, message:'tidak ditemukan'})
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
                    return res.status(404).json({success:false, message:'tidak ditemukan'})
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

    // exelToDB: async (req, res) => {

    //     if (req.file == undefined) {
    //         return res.status(400).send("Please upload an excel file!");
    //     }

    //     try {

    //         let path = `${req.file.destination}/${req.file.filename}`

    //         const workbook = xlsx.read(path, { type: 'file' });
    //         const [firstSheetName] = workbook.SheetNames;
    //         const worksheet = workbook.Sheets[firstSheetName];
    //         const rows = await xlsx.utils.sheet_to_json(worksheet, {
    //             header: 'A',
    //             range: 0,
    //             blankrows: false,
    //             defval: null,
    //             raw: true,
    //         });

    //         rows.shift();
    //         rows.shift();
    //         rows.shift();

    //         let count = await Spm.count();
            
    //             rows.forEach(async (row) => {
    //                 let box = row['A'].split('.');
    //                     box = box[box.length - 1];
                    
    //                 count++;
    //                 let dokIdIndex = await setId(count);
                    
    //                 let input = {
    //                     lokasi_fisik: row['A'],
    //                     skpd        : row['B'],
    //                     kepada      : row['C'],
    //                     keperluan   : row['D'],
    //                     no_spm      : row['E'],
    //                     no_sp2d     : row['F'],
    //                     tgl_spm     : new moment.utc(row['G'],'DD-MM-YYYY'),
    //                     fk_cat_id   : 'spm',
    //                     dok_id      : `SPM_${dokIdIndex}`,
    //                     box         : box
    //                 };
    //                 let newSpm = await Spm.create(input,{ raw: true});

    //                 let now = moment(); 
    //                 await LogActivity.create({
    //                     fk_username: req.user.username,
    //                     activity_type: CREATE,
    //                     activity_object: DOCUMENT,
    //                     activity_object_detil: newSpm.dok_id,
    //                     activity_desc: `${req.user.username} ${CREATE} ${DOCUMENT} ${newSpm.dok_id} pada ${now}`,
    //                     activity_times: now,
    //                 });

    //             });

    //         res.status(200).json({
    //             success: true,
    //             data: 'import data telah berhasil dilakukan'
    //         })

    //     }catch(error) {
    //         console.log(error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'maaf, terjadi kesalahan pada server'
    //         });
    //     }
    // },

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

            let CatSpm = await Category.findOne({
                where:{ id: 'spm'}
            });
            let count = await CatSpm.index_id;
            
            await sequelize.transaction(async (t) => {
                let promises = []
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
                        box         : box,
                        'pending':true
                    };

                    let newSpm = Spm.create(input,{raw: true},{transaction:t});
                    promises.push(newSpm);

                    let now = moment(); 
                    let LogActivityNew = LogActivity.create({
                        fk_username: req.user.username,
                        activity_type: CREATE,
                        activity_object: DOCUMENT,
                        activity_object_detil: `SPM_${dokIdIndex}`,
                        activity_desc: `${req.user.username} ${CREATE} ${DOCUMENT} ${newSpm.dok_id} pada ${now}`,
                        activity_times: now,
                        'pending':true
                    },{raw: true},{transaction:t});
                    promises.push(LogActivityNew);
                });

                let newCount = Category.update(
                    {
                        index_id: count,
                        'pending':true
                    },{
                        where:{ id: 'spm'}
                    },{ transaction: t})
                promises.push(newCount);

                return Promise.all(promises);
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

    // 
    
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
            
            let templateFile = "spm-template-report.pug"
            let templatePath = path.resolve(__dirname,'../views/report/',templateFile);
            let inputDir = path.resolve(templatePath, "..");
            let inputFilenameNoExt = path.basename(templateFile, path.extname(templateFile));
            let output = path.join(inputDir, inputFilenameNoExt + ".pdf");
            let outputPath = path.resolve(output);

            var tempDir = inputDir;

            let tempHTMLPath = path.join(tempDir, inputFilenameNoExt + "_temp.htm");

            const puppeteerConfig = {
                headless: true,
                args: []
            };

            const browser = await puppeteer.launch(puppeteerConfig);
            const page = await browser.newPage();
            page
                .on("pageerror", function(err) {
                    console.log("Page error: " + err.toString());
                })
                .on("error", function(err) {
                    console.log("Error: " + err.toString());
                });

            let pdfBuffer = await toPdf.masterDocumentToPDF(
                    templatePath,page,tempHTMLPath,outputPath,                    
                    data
                );
            
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=report-spm.pdf',
                'Content-Length': pdfBuffer.length
            });
            res.end(pdfBuffer);

        } catch(error){
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    }
}