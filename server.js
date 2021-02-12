const express = require('express');
const server = express();

const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
server.use(cors())

server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({limit: '50mb'}));

server.use(express.static("public"));

//setup routes
server.get('/', (req, res) => {
    res.send('oke udah jalan sob!!!!');
})
require('./routes')(server);


server.listen(process.env.PORT || 3000, () => {
    console.log(`hai, server dms sudah jalan !`)
})