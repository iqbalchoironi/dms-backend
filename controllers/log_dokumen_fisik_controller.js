const LogDocumentPhisic = require('../models').log_dok_fisik;
const LogActivity = require('../models').log_activity;
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { PRINT, REPORT, CREATE, LOAN, UPDATE, DELETE } = require('../helpers/logType');
const moment = require('moment');

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

        req.body.fk_user_id = req.user.user_id;
        req.body.date_pinjam = new moment.utc();

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
                    return res.status(404).send('gak ada sob');
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
                    return res.status(404).send('gak ada sob');
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
            // let data = await Spj.findAll(filter);

            let ejs = require("ejs");
            let pdf = require("html-pdf");
            let path = require("path");

            let dataRender = await ejs.renderFile(path.join(__dirname,'../views/report/','peminjaman.ejs'),{data,total});
            let options = {
                "format": "A3",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
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

            pdf.create(dataRender, options).toFile("reportPeminjaman.pdf", async function (err, data) {
                if (err) {
                    res.send(err);
                } else {

                    let now = moment(); 
                    await LogActivity.create({
                        fk_username: req.user.username,
                        activity_type: PRINT,
                        activity_object: REPORT,
                        activity_object_detil: `${PRINT} ${REPORT} ${LOAN}`,
                        activity_desc: `${req.user.username} ${PRINT} ${REPORT} ${LOAN} pada ${now}`,
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