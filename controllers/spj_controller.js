const spj = require('../models').dok_spj;

module.exports = {
    readSPJ: async(req, res) => {

        try {
            let data = await spj.findAll({limit:10});
            res.json(data);
        } catch(error){
            console.error(error);
        }
    }
}