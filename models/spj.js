module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('dok_spj', {
        dok_id: {
            primaryKey: true,
            type: DataTypes.STRING,
        },
        fk_cat_id: {
            type: DataTypes.STRING,
        },
        dok_header: {
            type: DataTypes.STRING,
            allowNull: false,
            },
        dok_desc: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        date_in: DataTypes.DATE,
        date_received: DataTypes.DATE,
        date_retensi: DataTypes.DATE,
        lokasi_fisik: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        skpd: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        kepada: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        keperluan: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tahun: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        box: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_active: DataTypes.STRING,
        a_group: DataTypes.STRING,
        group_id: DataTypes.STRING,
    }, 
    {
        //   createdAt: 'CreatedDate',
        //   updatedAt: 'LastUpdated',
        timestamps: false,
        freezeTableName: true,
    });
    // Schema.associate = (models) => {};
    return Schema;
};