const spj_router = require('./spj_router');
const spm_router = require('./spm_router');
const user_router = require('./user_route');
const role_user_router = require('./role_user_route');
const category_router = require('./category_route');
const logPhysicalDocument = require('./log_dokumen_fisik_route');
const logAcivityRouter = require('./log_activity');
const dokumen_file_route = require('./dokumen_file_route');

module.exports = (server) => {
    server.use('/api/v1', spj_router);
    server.use('/api/v1', spm_router);
    server.use('/api/v1', user_router);
    server.use('/api/v1', role_user_router);
    server.use('/api/v1', category_router);
    server.use('/api/v1', logPhysicalDocument);
    server.use('/api/v1', logAcivityRouter);
    server.use('/api/v1', dokumen_file_route);
}