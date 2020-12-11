const DokFile = require('../models').dokumen_files;
const LogActivity = require('../models').log_activity;
const { sequelize } = require('../models');

module.exports = {
    sendFile: async(req, res) => {
        try {

            let valiableDokumen = await sequelize.transaction(async (t) => {
                let valiableDok = await DokFile.findOne({where:{ dokumen_name: req.params.id}},{ transaction: t });

                if (!valiableDokumen) {
                    return res.status(404).json({
                        success: false,
                        message: "source tidak tersedia"
                    });
                }

                await LogActivity.create({
                    fk_username:'',
                    activity_type:'',
                    activity_object:'',
                    activity_object_detil:'',
                    activity_desc:'',
                    activity_times:'',
                },{ transaction: t});

                return valiableDok;
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