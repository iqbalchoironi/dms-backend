const spj_router = require('./spj_router');
const spm_router = require('./spm_router');
const user_router = require('./user_route');
const role_user_router = require('./role_user_route');

module.exports = (server) => {
    server.use('/api/v1', spj_router);
    server.use('/api/v1', spm_router);
    server.use('/api/v1', user_router);
    server.use('/api/v1', role_user_router);
}