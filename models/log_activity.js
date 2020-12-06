module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('log_activity', {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        fk_username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        activity_type: {
            type: DataTypes.STRING,
        },
        activity_object: {
            type: DataTypes.STRING,
        },
        activity_object_detil: {
            type: DataTypes.STRING,
        },
        activity_desc: {
            type: DataTypes.STRING,
        },
        activity_times: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, 
    {
        // createdAt: 'CreatedDate',
        // updatedAt: 'LastUpdated',
        timestamps: false,
        freezeTableName: true,
    });
    // Schema.associate = (models) => {};
    return Schema;
};