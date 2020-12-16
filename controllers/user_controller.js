const User = require('../models').users;
const {hashPassword,comparePassword, generateUserToken} = require('../helpers/auth');
const LogActivity = require('../models').log_activity;
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { USER, CREATE, UPDATE, DELETE } = require('../helpers/logType');
const moment = require('moment');

module.exports = {
    login: async(req, res) => {

        let { username, password } = req.body;

        try {

            let valiableUser = await User.findOne({where:{ username: username}});

            if (!valiableUser) {
                return res.status(401).json({
                    success: false,
                    message: "username atau password salah"
                });
            }

            if (!valiableUser.is_active) {
                return res.status(401).json({
                    success: false,
                    message: "status pengguna tidak aktif"
                });
            }
            
            if (!comparePassword(valiableUser.password, password)) {
                return res.status(401).json({
                    success: false,
                    message: "username atau password salah"
                });
            }

            let token = generateUserToken(valiableUser.id, valiableUser.username, valiableUser.is_active, valiableUser.role_user_id);
            
            res.status(200).send({
                token: token,
                user_id:valiableUser.id,
                username:valiableUser.username
            });

        }catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
        
    },

    read: async(req, res) => {
        const {
            query : {
                username, 
                role_user_id, 
                name, 
                is_active,
                page,
                limit,
            }
        } = req;

        let filter = {
            raw: false,
            limit: parseInt(limit),
            offset: parseInt(limit) * (parseInt(page) - 1),
            order: [],
            where: {},
            attributes: ['id','username','name','role_user_id','is_active']
        };

        
        if (username) {
            filter.where.username = { [Op.like]: `%${username}%` };
        }
        if (role_user_id) {
            filter.where.role_user_id = role_user_id;
        }
        if (name) {
            filter.where.name = { [Op.like]: `%${name}%` };
        }
        if (is_active) {
            filter.where.is_active = is_active;
        }

        try {
            let {count: total, rows: data} = await User.findAndCountAll(filter);
            res.status(200).json({
                success: true,
                total,
                data
            });
        } catch(error){
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            })
        }
    },

    create: async(req, res) => {

        try {

            let valiableUser = await User.findOne({where:{ username: req.body.username}});

            if (valiableUser) {
                return res.status(400).json({
                    success: false,
                    message: "username telah digunakan"
                });
            }

            if (req.body.password) {
                let hashedPassword = hashPassword(req.body.password);
                req.body.password = hashedPassword;
            }

            let newUser = await sequelize.transaction(async (t) => {

                let newUser = await User.create(req.body,{ transaction: t});

                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: CREATE,
                    activity_object: USER,
                    activity_object_detil: newUser.username,
                    activity_desc: `${req.user.username} ${CREATE} ${USER} ${newUser.username} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

                return newUser;
            });


            if (newUser) {
                res.status(200).json({
                    success: true,
                    message: "user telah dibuat"
                });
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

            let valiableUser = await User.findOne({where:{ id: req.params.id}});
        
            if (!valiableUser) {
                return res.status(404).send('gak ada sob');
            }
    
            if (req.body.username) {
                delete req.body.username;
            }

            if (req.body.password) {
                let hashedPassword = hashPassword(req.body.password);
                req.body.password = hashedPassword;
            }

            await sequelize.transaction(async t => {

                await valiableUser.update(req.body, {transaction: t});
    
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: UPDATE,
                    activity_object: USER,
                    activity_object_detil: valiableUser.username,
                    activity_desc: `${req.user.username} ${UPDATE} ${USER} ${valiableUser.username} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

            })


            res.status(200).json({
                success: true,
                message: "user telah diupdate"
            });

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

            let valiableUser = await User.findOne({where:{ id: req.params.id}});
        
            if (!valiableUser) {
                return res.status(404).send('gak ada sob');
            }
            
            await sequelize.transaction( async t => {

                await valiableUser.destroy({transaction: t});
    
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: DELETE,
                    activity_object: USER,
                    activity_object_detil: valiableUser.username,
                    activity_desc: `${req.user.username} ${DELETE} ${USER} ${valiableUser.username} pada ${now}`,
                    activity_times: now,
                },{ transaction: t});

            })

            res.json({
                success: true,
                message: 'pengguna telah dihapus'
            });

        }catch(error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'maaf, terjadi kesalahan pada server'
            });
        }
    }
}