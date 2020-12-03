const express = require('express');
const server = express();

const dotenv = require('dotenv');
dotenv.config();


server.listen(process.env.PORT || 3000, () => {
    console.log(`hai, server dms sudah jalan !`)
} )

