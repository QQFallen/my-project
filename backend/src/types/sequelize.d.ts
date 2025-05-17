import { DataTypes as SequelizeDataTypes } from 'sequelize';

declare global {
    const DataTypes: typeof SequelizeDataTypes;
}

export {}; 