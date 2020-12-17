const Spj = require('../models').dok_spj;
const Spm = require('../models').dok_spm;

module.exports = {
    read: async (req, res) => {

        try {

            let spmCount = await Spm.count();
            let spjCount = await Spj.count();

            res.status(200).json({
                success: true,
                spjCount,
                spmCount
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    }
}