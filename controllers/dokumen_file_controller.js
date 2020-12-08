const DokFile = require('../models').dokumen_files;

module.exports = {
    sendFile: async(req, res) => {
        try {

            let valiableDokumen = await DokFile.findOne({where:{ dokumen_name: req.params.id}});
        
            if (!valiableDokumen) {
                return res.status(404).send('gak ada sob');
            }

            let file = `${process.env.STORAGE_ROOT}${valiableDokumen.dokumen_path}/${valiableDokumen.dokumen_name}`;
            res.status(200).sendFile(file);

        }catch(error) {
            res.status(200).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            })
        }
    }
}