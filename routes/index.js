const spj_router = require('./spj_router');

module.exports = (server) => {
    server.use('/api/v1', spj_router);
}