module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('log_dok_fisik', {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        fk_dok_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date_pinjam: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_hrs_kembali: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_kembali: {
            type: DataTypes.DATE,
        },
        peminjam: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        log_desc: {
            type: DataTypes.TEXT,
        },
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