import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@config/db';

class User extends Model {
    declare id: number;
    declare email: string;
    declare firstName: string;
    declare lastName: string;
    declare middleName?: string | null;
    declare gender: string;
    declare dateOfBirth: Date;
    declare password: string;
    declare role: 'user' | 'admin';
    declare createdAt: Date;
    declare updatedAt: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        middleName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dateOfBirth: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: [['user', 'admin']]
            }
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true
    }
);

export default User;
