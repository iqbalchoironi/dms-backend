const Spm = require('../models').dok_spm;
const { Op } = require('sequelize');
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
            res.status(200).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            })
        }
    },

    create: async(req, res) => {

        try {

            let box = req.body.lokasi_fisik.split('.');
            box = box[box.length - 1].substring(1)
            req.body.box = box;

            let count = await Spm.count() + 1;
            let dok_id = `SPM_${count}`;
            req.body.dok_id = dok_id;

            let newSpm = await Spm.create(req.body);

            if (newSpm) {
                res.status(200).json(newSpm);
            }

        }catch(error) {
            console.log(error)
        }
    },

    update: async(req, res) => {

        try {

            let valiableSpm = await Spm.findOne({where:{ dok_id: req.params.id}});
        
            if (!valiableSpm) {
                return res.status(404).send('gak ada sob');
            }

            if (req.body.lokasi_fisik) {
                let box = req.body.lokasi_fisik.split('.');
                box = box[box.length - 1].substring(1)
                req.body.box = box;
            }
    
            await valiableSpm.update(req.body);
            res.status(200).json(valiableSpm);

        }catch(error) {

        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableSpm = await Spm.findOne({where:{ dok_id: req.params.id}});
        
            if (!valiableSpm) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableSpm.destroy();
            res.status(200).send('udah di delete');

        }catch(error) {
            
        }
    }
}