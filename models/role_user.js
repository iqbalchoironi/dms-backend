module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('role_user', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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