const LogDocumentPhisic = require('../models').log_dok_fisik;
const LogActivity = require('../models').log_activity;
const Spm = require('../models').dok_spm;
const Spj = require('../models').dok_spj;
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { PRINT, REPORT, CREATE, LOAN, UPDATE, DELETE } = require('../helpers/logType');
const moment = require('moment');
const puppeteer = require("puppeteer");
const toPdf = require('../helpers/toPdf');
const path = require("path");

module.exports = {

    read: async(req, res) => {

        const {
            query : {
                fk_dok_id, 
                date_pinjam, 
                date_hrs_kembali, 
                date_kembali,
                peminjam,
                fk_user_id,
                log_desc,
                page,
                limit,
            }
        } = req;

        let filter = {
            raw: false,
            limit: parseInt(limit),
            offset: parseInt(limit) * (parseInt(page) - 1),
            order: [],
            where: {},
            order: [
                ['date_kembali', 'ASC'],
            ]
        };

        if (fk_dok_id) {
            filter.where.fk_dok_id = { [Op.like]: `%${fk_dok_id}%` };
        }
        if (date_pinjam) {
            filter.where.date_pinjam = {  [Op.between]: [new Date(date_pinjam), new Date(date_pinjam).setHours(24,0,0)] };
        }
        if (date_hrs_kembali) {
            filter.where.date_hrs_kembali = {  [Op.between]: [new Date(date_hrs_kembali), new Date(date_hrs_kembali).setHours(24,0,0)] };
        }
        if (date_kembali) {
            filter.where.date_kembali = {  [Op.between]: [new Date(date_kembali), new Date(date_kembali).setHours(24,0,0)] };
        }
        if (peminjam) {
            filter.where.peminjam = { [Op.like]: `%${peminjam}%` };
        }
        if (fk_user_id) {
            filter.where.fk_user_id = { [Op.like]: `%${fk_user_id}%` };
        }
        if (log_desc) {
            filter.where.log_desc = { [Op.like]: `%${log_desc}%` };
        }

        try {
            let {count: total, rows: data} = await LogDocumentPhisic.findAndCountAll(filter);

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

        if (!Date.parse(req.body.date_pinjam)) {
            delete req.body.date_pinjam;
        }
        if (!Date.parse(req.body.date_hrs_kembali)) {
            delete req.body.date_hrs_kembali;
        }
        if (!Date.parse(req.body.date_kembali)) {
            delete req.body.date_kembali;
        }

        req.body.fk_user_id = req.user.username;
        req.body.date_pinjam = new moment.utc();

        let valiableSpm = await Spm.findOne({where:{dok_id: req.body.fk_dok_id}});
        let valiableSpj = await Spj.findOne({where:{dok_id: req.body.fk_dok_id}});

        if (!valiableSpj && !valiableSpm){
            return res.status(400).json({
                success: false,
                message: "dokumen id tidak dikenali"
            });
        }
        
        let valiableDokId = await LogDocumentPhisic.findOne({
            where:{ 
                fk_dok_id: req.body.fk_dok_id,
                date_kembali: null
            }
        });

        if (valiableDokId){
            return res.status(400).json({
                success: false,
                message: "dokumen telah dipinjamkan"
            });
        }

        try {

            let newLogDocumentPhisic = await sequelize.transaction(async (t) => {

                let newLogDocumentPhisic = await LogDocumentPhisic.create(req.body);
                
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: CREATE,
                    activity_object: LOAN,
                    activity_object_detil: newLogDocumentPhisic.fk_dok_id,
                    activity_desc: `${req.user.username} ${CREATE} ${LOAN} ${newLogDocumentPhisic.fk_dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

                return newLogDocumentPhisic
            });

            if (newLogDocumentPhisic) {
                res.status(200).json(newLogDocumentPhisic);
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

        try {

            let valiableLogDocumentPhisic = sequelize.transaction(async (t) => {

                let valiableLogDocumentPhisic = await LogDocumentPhisic.findOne({where:{ id: req.params.id}});

                if (!valiableLogDocumentPhisic) {
                    return res.status(404).json({success:false, message:'tidak ditemukan'})
                }
    
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: UPDATE,
                    activity_object: LOAN,
                    activity_object_detil: valiableLogDocumentPhisic.fk_dok_id,
                    activity_times: now,
                    activity_desc: `${req.user.username} ${UPDATE} ${LOAN} ${valiableLogDocumentPhisic.fk_dok_id} pada ${now}`,
                },{ transaction: t});

                await valiableLogDocumentPhisic.update(req.body);

                return valiableLogDocumentPhisic;
            })
            
        
    
            res.status(200).json(valiableLogDocumentPhisic);

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
                
                let valiableLogDocumentPhisic = await LogDocumentPhisic.findOne({where:{ id: req.params.id}});
            
                if (!valiableLogDocumentPhisic) {
                    return res.status(404).json({success:false, message:'tidak ditemukan'})
                }
    
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: DELETE,
                    activity_object: LOAN,
                    activity_object_detil: valiableLogDocumentPhisic.fk_dok_id,
                    activity_desc: `${req.user.username} ${DELETE} ${LOAN} ${valiableLogDocumentPhisic.fk_dok_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});
        
                await valiableLogDocumentPhisic.destroy({transaction:t});

            });
            
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

    // makeReport: async (req, res) => {
    //     const {
    //         query : {
    //             fk_dok_id, 
    //             date_pinjam, 
    //             date_hrs_kembali, 
    //             date_kembali,
    //             peminjam,
    //             fk_user_id,
    //             log_desc,
    //             // page,
    //             // limit,
    //         }
    //     } = req;

    //     let filter = {
    //         raw: false,
    //         // limit: parseInt(limit),
    //         // offset: parseInt(limit) * (parseInt(page) - 1),
    //         order: [],
    //         where: {},
    //     };

    //     if (fk_dok_id) {
    //         filter.where.fk_dok_id = { [Op.like]: `%${fk_dok_id}%` };
    //     }
    //     if (date_pinjam) {
    //         filter.where.date_pinjam = {  [Op.between]: [new Date(date_pinjam), new Date(date_pinjam).setHours(24,0,0)] };
    //     }
    //     if (date_hrs_kembali) {
    //         filter.where.date_hrs_kembali = {  [Op.between]: [new Date(date_hrs_kembali), new Date(date_hrs_kembali).setHours(24,0,0)] };
    //     }
    //     if (date_kembali) {
    //         filter.where.date_kembali = {  [Op.between]: [new Date(date_kembali), new Date(date_kembali).setHours(24,0,0)] };
    //     }
    //     if (peminjam) {
    //         filter.where.peminjam = { [Op.like]: `%${peminjam}%` };
    //     }
    //     if (fk_user_id) {
    //         filter.where.fk_user_id = { [Op.like]: `%${fk_user_id}%` };
    //     }
    //     if (log_desc) {
    //         filter.where.log_desc = { [Op.like]: `%${log_desc}%` };
    //     }

    //     try {
    //         let {count: total, rows: data} = await LogDocumentPhisic.findAndCountAll(filter);
    //         // let data = await Spj.findAll(filter);

    //         let ejs = require("ejs");
    //         let pdf = require("html-pdf");
    //         let path = require("path");

    //         let dataRender = await ejs.renderFile(path.join(__dirname,'../views/report/','peminjaman.ejs'),{data,total});
    //         let options = {
    //             "format": "A3",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
    //             "orientation": "landscape",
    //             "paginationOffset": 1,
    //             // "directory": '/temp',
    //             "header": {
    //                 "height": "10mm",
    //             },
    //             "footer": {
    //                 "height": "10mm",
    //             },
    //         };

    //         pdf.create(dataRender, options).toFile("reportPeminjaman.pdf", async function (err, data) {
    //             if (err) {
    //                 res.send(err);
    //             } else {

    //                 let now = moment(); 
    //                 await LogActivity.create({
    //                     fk_username: req.user.username,
    //                     activity_type: PRINT,
    //                     activity_object: REPORT,
    //                     activity_object_detil: `${PRINT} ${REPORT} ${LOAN}`,
    //                     activity_desc: `${req.user.username} ${PRINT} ${REPORT} ${LOAN} pada ${now}`,
    //                     activity_times: now,
    //                 });

    //                 res.download(data.filename);

    //             }
    //         });

    //     } catch(error){
    //         console.log(error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'maaf, terjadi kesalahan pada server'
    //         });
    //     }
    // }

    makeReport: async (req, res) => {
        const {
            query : {
                fk_dok_id, 
                date_pinjam, 
                date_hrs_kembali, 
                date_kembali,
                peminjam,
                fk_user_id,
                log_desc,
                // page,
                // limit,
            }
        } = req;

        let filter = {
            raw: false,
            // limit: parseInt(limit),
            // offset: parseInt(limit) * (parseInt(page) - 1),
            order: [],
            where: {},
        };

        if (fk_dok_id) {
            filter.where.fk_dok_id = { [Op.like]: `%${fk_dok_id}%` };
        }
        if (date_pinjam) {
            filter.where.date_pinjam = {  [Op.between]: [new Date(date_pinjam), new Date(date_pinjam).setHours(24,0,0)] };
        }
        if (date_hrs_kembali) {
            filter.where.date_hrs_kembali = {  [Op.between]: [new Date(date_hrs_kembali), new Date(date_hrs_kembali).setHours(24,0,0)] };
        }
        if (date_kembali) {
            filter.where.date_kembali = {  [Op.between]: [new Date(date_kembali), new Date(date_kembali).setHours(24,0,0)] };
        }
        if (peminjam) {
            filter.where.peminjam = { [Op.like]: `%${peminjam}%` };
        }
        if (fk_user_id) {
            filter.where.fk_user_id = { [Op.like]: `%${fk_user_id}%` };
        }
        if (log_desc) {
            filter.where.log_desc = { [Op.like]: `%${log_desc}%` };
        }

        try {
            let {count: total, rows: data} = await LogDocumentPhisic.findAndCountAll(filter);
            
            let templateFile = "peminjaman-template-report.pug"
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
                'Content-Disposition': 'attachment; filename=report-spj.pdf',
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