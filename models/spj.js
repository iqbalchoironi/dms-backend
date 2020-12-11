module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('dok_spj', {
        dok_id: {
            primaryKey: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        fk_cat_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dok_header: {
            type: DataTypes.STRING,
            },
        dok_desc: {
            type: DataTypes.TEXT,
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
        is_active: {
            type: DataTypes.STRING,
            defaultValue: 1
        },
    }, 
    {
        //   createdAt: 'CreatedDate',
        //   updatedAt: 'LastUpdated',
        timestamps: false,
        freezeTableName: true,
    });
    Schema.associate = (models) => {
        models.dok_spj.hasOne(models.dokumen_files, {
            foreignKey: 'dokumen_id'
        })
    };
    return Schema;
};