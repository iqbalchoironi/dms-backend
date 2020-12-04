const Category = require('../models').kategori;

module.exports = {

    read: async(req, res) => {

        try {
            let data = await Category.findAll({limit:parseInt(req.query.limit)});
            res.json(data);
        } catch(error){
            console.error(error);
        }
    },

    create: async(req, res) => {

        try {

            let valiableCategory = await Category.findOne({where:{ id: req.body.id}});

            if (valiableCategory) {
                return res.status(404).send('udah ada Categoryname lu sob');
            }

            let newCategory = await Category.create(req.body);

            if (newCategory) {
                res.status(200).json(newCategory);
            }

        }catch(error) {
            console.log(error)
        }
    },

    update: async(req, res) => {

        try {

            let valiableCategory = await Category.findOne({where:{ id: req.params.id}});
        
            if (!valiableCategory) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableCategory.update(req.body);
            res.status(200).json(valiableCategory);

        }catch(error) {

        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableCategory = await Category.findOne({where:{ id: req.params.id}});
        
            if (!valiableCategory) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableCategory.destroy();
            res.status(200).send('udah di delete');

        }catch(error) {
            
        }
    }
}