module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('users', {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_active: DataTypes.BOOLEAN,
    }, 
    {
        createdAt: 'CreatedDate',
        updatedAt: 'LastUpdated',
        // timestamps: false,
        freezeTableName: true,
    });
    // Schema.associate = (models) => {};
    return Schema;
};