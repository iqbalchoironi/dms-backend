const Spj = require('../models').dok_spj;
const { Op } = require('sequelize');

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

            let count = await Spj.count() + 1;
            let dok_id = `SPJ_${count}`;
            req.body.dok_id = dok_id;

            let newSpj = await Spj.create(req.body);

            if (newSpj) {
                res.status(200).json(newSpj);
            }

        }catch(error) {
            console.log(error)
        }
    },

    update: async(req, res) => {

        try {

            let valiableSpj = await Spj.findOne({where:{ dok_id: req.params.id}});
        
            if (!valiableSpj) {
                return res.status(404).send('gak ada sob');
            }

            if (req.body.lokasi_fisik) {
                let box = req.body.lokasi_fisik.split('.');
                box = box[box.length - 1].substring(1)
                req.body.box = box;
            }
    
            await valiableSpj.update(req.body);
            res.status(200).json(valiableSpj);

        }catch(error) {

        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableSpj = await Spj.findOne({where:{ dok_id: req.params.id}});
        
            if (!valiableSpj) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableSpj.destroy();
            res.status(200).send('udah di delete');

        }catch(error) {
            
        }
    }
}