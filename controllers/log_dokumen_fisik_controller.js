const LogDocumentPhisic = require('../models').log_dok_fisik;
const { Op } = require('sequelize');

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
            // let data = await LogDocumentPhisic.findAll(filter);
            res.status(200).json({
                success: true,
                total,
                data
            });
        } catch(error){
            res.status(200).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            })
        }
    },

    create: async(req, res) => {

        try {

            let newLogDocumentPhisic = await LogDocumentPhisic.create(req.body);

            if (newLogDocumentPhisic) {
                res.status(200).json(newLogDocumentPhisic);
            }

        }catch(error) {
            console.log(error)
        }
    },

    update: async(req, res) => {

        try {

            let valiableLogDocumentPhisic = await LogDocumentPhisic.findOne({where:{ id: req.params.id}});
        
            if (!valiableLogDocumentPhisic) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableLogDocumentPhisic.update(req.body);
            res.status(200).json(valiableLogDocumentPhisic);

        }catch(error) {
            console.log(error)
        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableLogDocumentPhisic = await LogDocumentPhisic.findOne({where:{ id: req.params.id}});
        
            if (!valiableLogDocumentPhisic) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableLogDocumentPhisic.destroy();
            res.status(200).send('udah di delete');

        }catch(error) {
            
        }
    }
}