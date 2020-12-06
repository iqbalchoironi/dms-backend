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
            // let data = await LogActivity.findAll(filter);
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

}