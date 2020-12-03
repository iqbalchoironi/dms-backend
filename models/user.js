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
            unique: true
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
            defaultValue:2
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        }
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