const LogDocumentPhisic = require('../models').log_dok_fisik;

module.exports = {

    read: async(req, res) => {

        try {
            let data = await LogDocumentPhisic.findAll({limit:parseInt(req.query.limit)});
            res.json(data);
        } catch(error){
            console.error(error);
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