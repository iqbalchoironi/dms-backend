const LogActivity = require('../models').log_activity;
const { Op } = require('sequelize');

module.exports = {

    read: async(req, res) => {

        const {
            query : {
                fk_username, 
                activity_type, 
                activity_object, 
                activity_object_detil,
                activity_times,
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
                ['activity_times', 'DESC'],
            ]
        };

        if (fk_username) {
            filter.where.fk_username = { [Op.like]: `%${fk_username}%` };
        }
        if (activity_type) {
            filter.where.activity_type = { [Op.like]: `%${activity_type}%` };
        }
        if (activity_object) {
            filter.where.activity_object = { [Op.like]: `%${activity_object}%` };
        }
        if (activity_object_detil) {
            filter.where.activity_object_detil = { [Op.like]: `%${activity_object_detil}%` };
        }
        if (activity_times) {
            filter.where.activity_times = {  [Op.between]: [new Date(activity_times), new Date(activity_times).setHours(24,0,0)] };
        }
        
        try {
            let {count: total, rows: data} = await LogActivity.findAndCountAll(filter);
            // let data = await LogActivity.findAll(filter);
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

    makeReport: async (req, res) => {
        const {
            query : {
                fk_username, 
                activity_type, 
                activity_object, 
                activity_object_detil,
                activity_times,
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

        if (fk_username) {
            filter.where.fk_username = { [Op.like]: `%${fk_username}%` };
        }
        if (activity_type) {
            filter.where.activity_type = activity_type;
        }
        if (activity_object) {
            filter.where.activity_object = activity_object;
        }
        if (activity_object_detil) {
            filter.where.activity_object_detil = { [Op.like]: `%${activity_object_detil}%` };
        }
        if (activity_times) {
            filter.where.activity_times = {  [Op.between]: [new Date(activity_times), new Date(activity_times).setHours(24,0,0)] };
        }

        try {
            let {count: total, rows: data} = await LogActivity.findAndCountAll(filter);
            // let data = await Spj.findAll(filter);

            let ejs = require("ejs");
            let pdf = require("html-pdf");
            let path = require("path");

            let dataRender = await ejs.renderFile(path.join(__dirname,'../views/report/','log.ejs'),{data,total});
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

            pdf.create(dataRender, options).toFile("log.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
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
    },

    remove: async(req, res) => {
        try {
                
            let valiableLog = await LogActivity.findOne({where:{ id: req.params.id}});
        
            if (!valiableLog) {
                return res.status(404).json({success:false, message:'tidak ditemukan'})
            }
    
            await valiableLog.destroy();
            
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

}