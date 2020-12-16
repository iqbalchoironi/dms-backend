const Role = require('../models').role_user;

module.exports = {

    read: async(req, res) => {

        try {
            let data = await Role.findAll({limit:parseInt(req.query.limit)});
            res.json(data);
        } catch(error){
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    create: async(req, res) => {

        try {

            let valiableRole = await Role.findOne({where:{ name: req.body.name}});

            if (valiableRole) {
                return res.status(404).send('udah ada Rolename lu sob');
            }

            let newRole = await Role.create(req.body);

            if (newRole) {
                res.status(200).json(newRole);
            }

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    },

    update: async(req, res) => {

        try {

            let valiableRole = await Role.findOne({where:{ id: req.params.id}});
        
            if (!valiableRole) {
                return res.status(404).send('gak ada sob');
            }

            await valiableRole.update(req.body);
            res.status(200).json(valiableRole);

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableRole = await Role.findOne({where:{ id: req.params.id}});
        
            if (!valiableRole) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableRole.destroy();
            res.status(200).send('udah di delete');

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    }
}