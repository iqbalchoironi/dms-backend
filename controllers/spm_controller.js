const Spm = require('../models').dok_spm;

module.exports = {
    
    read: async(req, res) => {

        try {
            
            let data = await Spm.findAll({limit:parseInt(req.query.limit)});
            res.status(200).json(data);

        } catch(error){
            console.error(error);
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