const User = require('../models').users;
const {hashPassword,comparePassword, generateUserToken} = require('../helpers/auth');

module.exports = {
    login: async(req, res) => {

        let { username, password } = req.body;

        try {

            let valiableUser = await User.findOne({where:{ username: username}});

            if (!valiableUser) {
                return res.status(404).send('ga ada username lu sob');
            }

            if (!comparePassword(valiableUser.password, password)) {
                return res.status(400).send('password lu slah sob');
            }

            let token = generateUserToken(valiableUser.id, valiableUser.username, valiableUser.is_active, valiableUser.role_user_id);
            
            return res.status(200).send({
                token: token,
                user_id:valiableUser.id,
                username:valiableUser.username
            });

        }catch (error) {
            console.log(error);
        }
        
    },

    read: async(req, res) => {

        try {
            let data = await User.findAll({limit:parseInt(req.query.limit)});
            res.json(data);
        } catch(error){
            console.error(error);
        }
    },

    create: async(req, res) => {
        let { username, password, name } = req.body;
        const hashedPassword = hashPassword(password);

        try {

            let valiableUser = await User.findOne({where:{ username: username}});

            if (valiableUser) {
                return res.status(404).send('udah ada username lu sob');
            }

            let newUser = await User.create({username, password: hashedPassword, name});

            if (newUser) {
                res.status(200).json(newUser);
            }

        }catch(error) {
            console.log(error)
        }
    },

    update: async(req, res) => {

        try {

            let valiableUser = await User.findOne({where:{ id: req.params.id}});
        
            if (!valiableUser) {
                return res.status(404).send('gak ada sob');
            }
    
            if (req.body.password) {
                let hashedPassword = hashPassword(req.body.password);
                req.body.password = hashedPassword;
            }
    
            await valiableUser.update(req.body);
            res.status(200).json(valiableUser);

        }catch(error) {

        }
        

    },

    remove: async(req, res) => {
        try {

            let valiableUser = await User.findOne({where:{ id: req.params.id}});
        
            if (!valiableUser) {
                return res.status(404).send('gak ada sob');
            }
    
            await valiableUser.destroy();
            res.status(200).send('udah di delete');

        }catch(error) {

        }
    }
}