const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const { authorization } = req.headers;

    if( !authorization ) {
        return res.status(401).json({
            success: false,
            message: "anda tidak memiliki kridensial yang valid"
        })
    }
    
    try {
        const decode = await jwt.verify(authorization, process.env.SECRET);
        req.user = {
            ...decode
        };

        if(req.user.is_active === false) {
            return res.status(403).json({
                success: false,
                message: "akun anda sudah tidak aktif"
            })
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'maaf, terjadi kesalahan pada server'
        });
    }
}

const isOperator = (req, res, next) => {
    if (req.user.role !== 1 && req.user.role !== 2) {
        return res.status(403).json({
            success: false,
            message: "anda tidak memiliki akses"
        })
    } else {
        next();
    }
}

const isAdmin = (req, res, next) => {
    if (req.user.role !== 1) {
        return res.status(403).json({
            success: false,
            message: "anda tidak memiliki akses"
        })
    } else {
        next();
    }
}

module.exports = { verifyToken, isAdmin, isOperator };