const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const hashPassword = password => bcrypt.hashSync(password, salt);

const comparePassword = (hashedPassword, password) => {
    return bcrypt.compareSync(password, hashedPassword);
};

const generateUserToken = (id, username, is_active, role) => {
    const token = jwt.sign({
        user_id: id,
        username,
        is_active,
        role,
    },
    process.env.SECRET, { expiresIn: '3d' });
    return token;
};

module.exports = { hashPassword ,comparePassword, generateUserToken };
  