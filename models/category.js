module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('kategori', {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        desc: {
            type: DataTypes.TEXT,
        },
        fk_table_name: {
            type: DataTypes.STRING,
        },
        icon: {
            type: DataTypes.STRING,
        },
        dir_location: {
            type: DataTypes.STRING,
        },
        index_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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