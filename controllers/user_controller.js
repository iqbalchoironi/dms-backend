const User = require('../models').users;
const {hashPassword,comparePassword, generateUserToken} = require('../helpers/auth');
const LogActivity = require('../models').log_activity;
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { USER, CREATE, UPDATE, UPDATE_PASSWORD, DELETE } = require('../helpers/logType');
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
            
            res.status(200).json({
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

            
            if (req.user.username !== 'admin123' && req.params.id === '0192023a7bbd73250516f069df18b500') {
                return res.status(404).json({
                    success: false,
                    message: 'anda tidak dapat mengubah admin ini'
                })
            }

            if (req.user.username === 'admin123' && req.params.id === '0192023a7bbd73250516f069df18b500') {
                delete req.body.role_user_id;
                delete req.body.is_active;
            }
            
            let valiableUser = await User.findOne({where:{ id: req.params.id}});

            if (!valiableUser) {
                return res.status(404).json({success:false, message:'tidak ditemukan'})
            }
    
            if (req.body.username) {
                delete req.body.username;
            }

            if (req.body.role_user_id == 1 && req.user.username !== 'admin123') {
                return res.status(404).json({
                    success: false,
                    message: 'anda tidak dapat mengubah user role menjadi admin'
                })
            }

            if (req.body.password) {
                return res.status(404).json({
                    success: false,
                    message: 'anda tidak dapat mengubah password disini'
                })
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

    updatePassword: async(req, res) => {

        let { admin_password, newpassword } = req.body;
        
        try {

            let valiableAdmin = await User.findOne({where:{ id: req.user.user_id}});
            let valiableUser = await User.findOne({where:{ id: req.params.id}});
        
            if (!valiableAdmin) {
                return res.status(404).send('admin gak ada sob');
            }

            if (!valiableUser) {
                return res.status(404).json({success:false, message:'tidak ditemukan'})
            }

            if (!comparePassword(valiableAdmin.password, admin_password)) {
                return res.status(401).json({
                    success: false,
                    message: "password admin salah"
                });
            }

            if (valiableAdmin.username !== valiableUser.username && valiableUser.role_user_id === 1 && valiableAdmin.username !== 'admin123') {
                return res.status(404).json({
                    success: false,
                    message: "admin tidak dapat merubah admin lain"
                });
            }

            let hashedPassword = hashPassword(newpassword);

            await sequelize.transaction(async t => {

                await valiableUser.update({ password: hashedPassword }, {transaction: t});
    
                let now = moment(); 
                await LogActivity.create({
                    fk_username: req.user.username,
                    activity_type: UPDATE_PASSWORD,
                    activity_object: USER,
                    activity_object_detil: valiableUser.username,
                    activity_desc: `${req.user.username} ${UPDATE_PASSWORD} ${USER} ${valiableUser.username} pada ${now}`,
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
                return res.status(404).json({success:false, message:'tidak ditemukan'})
            }

            if (valiableUser.username === req.user.username) {
                return res.status(404).json({
                    success: false,
                    message: 'anda tidak bisa menghapus diri sendiri'
                })
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