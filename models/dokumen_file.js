module.exports = (sequelize, DataTypes) => {
    const Schema = sequelize.define('dokumen_files', {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            unique: true,
            defaultValue: DataTypes.UUIDV4,
        },
        dokumen_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dokumen_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dokumen_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dokumen_size: {
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        dokumen_file_type: {
            type: DataTypes.STRING,
            allowNull:false,
        }
    }, 
    {
        createdAt: 'CreatedDate',
        updatedAt: 'LastUpdated',
        // timestamps: false,
        freezeTableName: true,
    });
    Schema.associate = (models) => {
        models.dokumen_files.belongsTo(models.dok_spj, {
            onDelete: 'CASCADE',
            foreignKey: 'dokumen_id',
            targetKey: 'dok_id',
        });
        models.dokumen_files.belongsTo(models.dok_spm, {
            onDelete: 'CASCADE',
            foreignKey: 'dokumen_id',
            targetKey: 'dok_id',
        });
    };
    return Schema;
};