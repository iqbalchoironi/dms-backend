require('dotenv').config(); 

module.exports =  {
    development: {
        username: process.env.DB_USERNAME_DEV,
        password: process.env.DB_PASS_DEV,
        database: process.env.DB_NAME_DEV,
        host    : process.env.DB_HOST_DEV,
        dialect :"mysql",
        pool: {
            max: 20,
            min: 0,
            acquire: 300000,
            idle: 70000
        }
    },
    test: {
        username:"root",
        password: null,
        database:"database_test",
        host:"127.0.0.1",
        dialect:"mysql"
    },
    production: {
        username:root,
        password: null,
        database:"database_production",
        host:"127.0.0.1",
        dialect:"mysql"
    }
}