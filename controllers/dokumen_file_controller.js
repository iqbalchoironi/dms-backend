const DokFile = require('../models').dokumen_files;
const LogActivity = require('../models').log_activity;
const { sequelize } = require('../models');
const { PRINT, DOCUMENT } = require('../helpers/logType');
const moment = require('moment');

module.exports = {
    sendFile: async(req, res) => {
        try {

            let valiableDokumen = await sequelize.transaction(async (t) => {
                let valiableDokumen = await DokFile.findOne({where:{ dokumen_name: req.params.id}},{ transaction: t });

                if (!valiableDokumen) {
                    return res.status(404).json({
                        success: false,
                        message: "source tidak tersedia"
                    });
                }
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: PRINT,
                    activity_object: DOCUMENT,
                    activity_object_detil: valiableDokumen.dokumen_id,
                    activity_desc: `${req.user.username} ${PRINT} ${DOCUMENT} ${valiableDokumen.dokument_id} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

                return valiableDokumen;
            })

            let file = `${process.env.STORAGE_ROOT}${valiableDokumen.dokumen_path}/${valiableDokumen.dokumen_name}`;
            res.status(200).download(file);

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    }
}