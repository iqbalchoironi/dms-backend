module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('dok_spm', {
        dok_id: {
            primaryKey: true,
            type: DataTypes.STRING,
        },
        fk_cat_id: {
            type: DataTypes.STRING,
        },
        dok_header: {
            type: DataTypes.STRING,
            // allowNull: false,
            },
        dok_desc: {
            type: DataTypes.TEXT,
            // allowNull: false,
        },
        date_in: DataTypes.DATE,
        date_received: DataTypes.DATE,
        date_retensi: DataTypes.DATE,
        lokasi_fisik: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        box: {
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
        no_sp2d: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        no_spm: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tgl_spm: {
            type: DataTypes.DATE,
        },
        is_active:{
            type: DataTypes.BOOLEAN,
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
        models.dok_spm.hasOne(models.dokumen_files, {
            foreignKey: 'dokumen_id'
        })
    };
    return Schema;
};