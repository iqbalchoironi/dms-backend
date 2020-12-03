const Spj = require('../models').dok_spj;

module.exports = {
    
    read: async(req, res) => {

        try {
            
            let data = await Spj.findAll({limit:parseInt(req.query.limit)});
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